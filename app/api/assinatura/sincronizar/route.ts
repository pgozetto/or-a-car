import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aplicarAssinatura } from "@/lib/assinatura-servidor";
import { buscarAssinatura, lerReferencia } from "@/lib/mercadopago";

// Consulta o Mercado Pago quando a pessoa volta do pagamento. Garante o plano
// liberado mesmo se o webhook atrasar (ou não chegar, em desenvolvimento).
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const { data: oficina } = await supabase
    .from("oficinas")
    .select("mp_preapproval_id")
    .maybeSingle();
  if (!oficina?.mp_preapproval_id) return NextResponse.json({ atualizado: false });

  try {
    const assinatura = await buscarAssinatura(oficina.mp_preapproval_id);
    if (lerReferencia(assinatura.external_reference)?.userId !== auth.user.id) {
      return NextResponse.json({ erro: "Assinatura de outra conta" }, { status: 403 });
    }
    return NextResponse.json(await aplicarAssinatura(assinatura));
  } catch (e) {
    console.error("Erro ao sincronizar assinatura", e);
    return NextResponse.json({ erro: "Falha ao consultar o pagamento" }, { status: 502 });
  }
}
