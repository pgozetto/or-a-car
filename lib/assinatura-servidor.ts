// Aplica no banco o estado de uma assinatura do Mercado Pago. Usa a chave
// secreta porque os campos de plano não podem ser alterados pelo usuário.
import { createSecretClient } from "./supabase/server";
import { camposDaAssinatura, lerReferencia, type Preapproval } from "./mercadopago";

export async function aplicarAssinatura(p: Preapproval) {
  const ref = lerReferencia(p.external_reference);
  if (!ref) return { atualizado: false, motivo: "referência inválida" };

  const admin = createSecretClient();
  const { data: oficina } = await admin
    .from("oficinas")
    .select("mp_preapproval_id, assinatura_status")
    .eq("id", ref.userId)
    .maybeSingle();
  if (!oficina) return { atualizado: false, motivo: "oficina não encontrada" };

  // Aviso atrasado de uma assinatura antiga não pode sobrescrever a atual.
  const eAtual = oficina.mp_preapproval_id === p.id;
  if (!eAtual && p.status !== "authorized") {
    return { atualizado: false, motivo: "assinatura antiga" };
  }

  const campos = camposDaAssinatura(p);
  const { error } = await admin
    .from("oficinas")
    .update(
      p.status === "pending" || p.status === "paused"
        ? // Ainda não pagou: guarda a assinatura sem trocar o plano.
          { mp_preapproval_id: campos.mp_preapproval_id, assinatura_status: campos.assinatura_status }
        : campos,
    )
    .eq("id", ref.userId);
  if (error) throw new Error(error.message);
  return { atualizado: true, status: campos.assinatura_status };
}
