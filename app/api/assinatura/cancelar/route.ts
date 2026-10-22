import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aplicarAssinatura } from "@/lib/assinatura-servidor";
import { cancelarAssinatura, lerReferencia, buscarAssinatura } from "@/lib/mercadopago";

// Cancela a cobrança recorrente. O plano continua valendo até o fim do
// período já pago (assinatura_fim).
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const { data: oficina } = await supabase
    .from("oficinas")
    .select("mp_preapproval_id")
    .maybeSingle();
  if (!oficina?.mp_preapproval_id) {
    return NextResponse.json({ erro: "Nenhuma assinatura para cancelar." }, { status: 400 });
  }

  try {
    const atual = await buscarAssinatura(oficina.mp_preapproval_id);
    if (lerReferencia(atual.external_reference)?.userId !== auth.user.id) {
      return NextResponse.json({ erro: "Assinatura de outra conta" }, { status: 403 });
    }
    // O PUT devolve a assinatura já cancelada, mas sem garantir a próxima
    // data de cobrança; busca de novo para saber até quando vale.
    await cancelarAssinatura(atual.id);
    const cancelada = await buscarAssinatura(atual.id);
    await aplicarAssinatura({
      ...cancelada,
      next_payment_date: cancelada.next_payment_date ?? atual.next_payment_date,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro ao cancelar assinatura", e);
    return NextResponse.json(
      { erro: "Não foi possível cancelar agora. Tente de novo em alguns minutos." },
      { status: 502 },
    );
  }
}
