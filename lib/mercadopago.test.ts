import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  assinaturaWebhookValida,
  camposDaAssinatura,
  lerReferencia,
  valorCobrado,
  type Preapproval,
} from "./mercadopago";

const segredo = "segredo-de-teste";
const assinar = (manifesto: string) =>
  createHmac("sha256", segredo).update(manifesto).digest("hex");

describe("assinaturaWebhookValida", () => {
  it("aceita a assinatura correta", () => {
    const v1 = assinar("id:abc123;request-id:req-1;ts:1700000000;");
    expect(
      assinaturaWebhookValida(`ts=1700000000,v1=${v1}`, "req-1", "ABC123", segredo),
    ).toBe(true);
  });

  it("recusa assinatura errada ou ausente", () => {
    expect(assinaturaWebhookValida("ts=1,v1=00", "req-1", "1", segredo)).toBe(false);
    expect(assinaturaWebhookValida(null, "req-1", "1", segredo)).toBe(false);
  });

  it("monta o manifesto sem os valores que faltam", () => {
    const v1 = assinar("id:42;ts:5;");
    expect(assinaturaWebhookValida(`ts=5,v1=${v1}`, null, "42", segredo)).toBe(true);
  });
});

describe("preço e referência", () => {
  it("cobra o valor da tabela, anual com 2 meses grátis", () => {
    expect(valorCobrado("oficina", "mensal")).toBe(49);
    expect(valorCobrado("oficina", "anual")).toBe(490);
    expect(valorCobrado("pro", "anual")).toBe(990);
  });

  it("lê a referência e recusa plano desconhecido", () => {
    expect(lerReferencia("u1|pro|anual")).toEqual({ userId: "u1", plano: "pro", ciclo: "anual" });
    expect(lerReferencia("u1|gratis|mensal")).toBeNull();
  });
});

describe("camposDaAssinatura", () => {
  const base: Preapproval = {
    id: "pre-1",
    status: "authorized",
    external_reference: "u1|oficina|mensal",
    init_point: "https://mp/checkout",
    next_payment_date: "2026-11-22T00:00:00Z",
    auto_recurring: { frequency: 1, transaction_amount: 49 },
  };

  it("autorizada vira ativa com o plano da referência", () => {
    expect(camposDaAssinatura(base)).toMatchObject({
      plano: "oficina",
      assinatura_status: "ativa",
      assinatura_ciclo: "mensal",
      mp_preapproval_id: "pre-1",
    });
  });

  it("cancelada guarda até quando vale", () => {
    expect(camposDaAssinatura({ ...base, status: "cancelled" })).toMatchObject({
      assinatura_status: "cancelada",
      assinatura_fim: "2026-11-22T00:00:00Z",
    });
  });
});
