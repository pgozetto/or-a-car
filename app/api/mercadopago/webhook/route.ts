import { NextResponse, type NextRequest } from "next/server";
import { createSecretClient } from "@/lib/supabase/server";
import { aplicarAssinatura } from "@/lib/assinatura-servidor";
import { assinaturaWebhookValida, buscarAssinatura } from "@/lib/mercadopago";

type Aviso = { type?: string; action?: string; data?: { id?: string } };

async function preapprovalDoPagamento(pagamentoId: string) {
  const resposta = await fetch(
    `https://api.mercadopago.com/authorized_payments/${encodeURIComponent(pagamentoId)}`,
    {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      cache: "no-store",
    },
  );
  if (!resposta.ok) throw new Error(`authorized_payments ${resposta.status}`);
  const pagamento = (await resposta.json()) as { preapproval_id?: string };
  return pagamento.preapproval_id ?? null;
}

// Avisos do Mercado Pago sobre assinaturas e cobranças recorrentes.
export async function POST(request: NextRequest) {
  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!segredo) {
    console.error("MERCADOPAGO_WEBHOOK_SECRET não configurado");
    return NextResponse.json({ erro: "não configurado" }, { status: 500 });
  }

  const aviso = (await request.json().catch(() => ({}))) as Aviso;
  const dataId = request.nextUrl.searchParams.get("data.id") ?? aviso.data?.id ?? null;
  const valida = assinaturaWebhookValida(
    request.headers.get("x-signature"),
    request.headers.get("x-request-id"),
    dataId,
    segredo,
  );
  if (!valida || !dataId) {
    return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
  }

  const tipo = aviso.type ?? request.nextUrl.searchParams.get("type") ?? "";
  await createSecretClient()
    .from("eventos_pagamento")
    .insert({ mp_id: dataId, tipo, payload: aviso });

  try {
    let preapprovalId: string | null = null;
    if (tipo === "subscription_preapproval") preapprovalId = dataId;
    else if (tipo === "subscription_authorized_payment") {
      preapprovalId = await preapprovalDoPagamento(dataId);
    }
    if (preapprovalId) await aplicarAssinatura(await buscarAssinatura(preapprovalId));
  } catch (e) {
    // 500 faz o Mercado Pago reenviar o aviso mais tarde.
    console.error("Erro ao processar aviso do Mercado Pago", e);
    return NextResponse.json({ erro: "falha ao processar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
