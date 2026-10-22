// Assinaturas do Mercado Pago (API /preapproval). Só para código de servidor:
// usa o access token secreto.
import { createHmac, timingSafeEqual } from "node:crypto";
import type { StatusAssinatura } from "./armazenamento";
import { MESES_PAGOS_NO_ANO, PLANOS } from "./planos";

const API = "https://api.mercadopago.com";

export type PlanoPago = "oficina" | "pro";
export type Ciclo = "mensal" | "anual";

export type Preapproval = {
  id: string;
  status: "pending" | "authorized" | "paused" | "cancelled";
  external_reference: string;
  init_point: string;
  next_payment_date?: string;
  auto_recurring: { frequency: number; transaction_amount: number };
};

function token() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  return t;
}

async function chamar<T>(caminho: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(`${API}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!resposta.ok) {
    throw new Error(`Mercado Pago ${resposta.status}: ${await resposta.text()}`);
  }
  return resposta.json() as Promise<T>;
}

// O preço vem sempre da tabela do servidor, nunca do navegador.
export function valorCobrado(plano: PlanoPago, ciclo: Ciclo) {
  const mensal = PLANOS.find((p) => p.id === plano)!.precoMensal;
  return ciclo === "anual" ? mensal * MESES_PAGOS_NO_ANO : mensal;
}

// external_reference guarda quem assinou e o quê: "<userId>|<plano>|<ciclo>".
export function lerReferencia(ref: string) {
  const [userId, plano, ciclo] = ref.split("|");
  if (!userId || (plano !== "oficina" && plano !== "pro")) return null;
  return {
    userId,
    plano: plano as PlanoPago,
    ciclo: (ciclo === "anual" ? "anual" : "mensal") as Ciclo,
  };
}

export async function criarAssinatura(dados: {
  userId: string;
  email: string;
  plano: PlanoPago;
  ciclo: Ciclo;
  voltarPara: string;
}) {
  const nome = PLANOS.find((p) => p.id === dados.plano)!.nome;
  return chamar<Preapproval>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: `OrçaCar ${nome} (${dados.ciclo})`,
      external_reference: `${dados.userId}|${dados.plano}|${dados.ciclo}`,
      payer_email: dados.email,
      back_url: dados.voltarPara,
      status: "pending",
      auto_recurring: {
        frequency: dados.ciclo === "anual" ? 12 : 1,
        frequency_type: "months",
        transaction_amount: valorCobrado(dados.plano, dados.ciclo),
        currency_id: "BRL",
      },
    }),
  });
}

export const buscarAssinatura = (id: string) =>
  chamar<Preapproval>(`/preapproval/${encodeURIComponent(id)}`);

export const cancelarAssinatura = (id: string) =>
  chamar<Preapproval>(`/preapproval/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status: "cancelled" }),
  });

// Converte a assinatura do Mercado Pago nos campos da tabela oficinas.
export function camposDaAssinatura(p: Preapproval) {
  const ref = lerReferencia(p.external_reference);
  const status: StatusAssinatura =
    p.status === "authorized"
      ? "ativa"
      : p.status === "pending"
        ? "pendente"
        : p.status === "cancelled"
          ? "cancelada"
          : "inativa";
  return {
    plano: ref?.plano ?? "gratis",
    assinatura_status: status,
    assinatura_ciclo: ref?.ciclo ?? null,
    // Cancelada: continua valendo até a próxima cobrança que não vai acontecer.
    assinatura_fim: p.next_payment_date ?? null,
    mp_preapproval_id: p.id,
  };
}

// Valida o header x-signature: HMAC-SHA256 de
// "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" com a assinatura secreta.
export function assinaturaWebhookValida(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string | null,
  segredo: string,
) {
  if (!xSignature) return false;
  const partes = Object.fromEntries(
    xSignature.split(",").map((p) => p.trim().split("=", 2) as [string, string]),
  );
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;

  let manifesto = "";
  if (dataId) manifesto += `id:${dataId.toLowerCase()};`;
  if (xRequestId) manifesto += `request-id:${xRequestId};`;
  manifesto += `ts:${ts};`;

  const esperado = createHmac("sha256", segredo).update(manifesto).digest("hex");
  const a = Buffer.from(esperado);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
