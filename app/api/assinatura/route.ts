import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aplicarAssinatura } from "@/lib/assinatura-servidor";
import { criarAssinatura, type Ciclo, type PlanoPago } from "@/lib/mercadopago";

// Cria a assinatura no Mercado Pago e devolve o link de pagamento.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const usuario = auth.user;
  if (!usuario?.email) {
    return NextResponse.json({ erro: "Entre na sua conta de novo." }, { status: 401 });
  }

  const corpo = await request.json().catch(() => ({}));
  const plano = corpo.plano as PlanoPago;
  const ciclo = corpo.ciclo as Ciclo;
  if (!["oficina", "pro"].includes(plano) || !["mensal", "anual"].includes(ciclo)) {
    return NextResponse.json({ erro: "Plano inválido." }, { status: 400 });
  }

  const { data: oficina } = await supabase
    .from("oficinas")
    .select("plano, assinatura_status")
    .maybeSingle();
  if (!oficina) {
    return NextResponse.json({ erro: "Cadastre a oficina antes de assinar." }, { status: 400 });
  }
  // Cancelada ainda no período pago pode assinar de novo; ativa não.
  if (oficina.plano !== "gratis" && oficina.assinatura_status === "ativa") {
    return NextResponse.json(
      { erro: "Você já tem uma assinatura ativa. Cancele a atual para trocar de plano." },
      { status: 409 },
    );
  }

  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
    const assinatura = await criarAssinatura({
      userId: usuario.id,
      email: usuario.email,
      plano,
      ciclo,
      voltarPara: `${site}/painel/conta?retorno=1`,
    });
    await aplicarAssinatura(assinatura);
    return NextResponse.json({ url: assinatura.init_point });
  } catch (e) {
    console.error("Erro ao criar assinatura", e);
    return NextResponse.json(
      { erro: "Não foi possível abrir o pagamento agora. Tente de novo em alguns minutos." },
      { status: 502 },
    );
  }
}
