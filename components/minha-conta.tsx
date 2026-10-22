"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useOficina } from "@/lib/use-oficina";
import {
  LIMITE_GRATIS,
  MESES_PAGOS_NO_ANO,
  PLANOS,
  formatarPreco,
  precoPorMes,
  temAssinaturaAtiva,
} from "@/lib/planos";
import { estiloBotaoPrincipal, estiloBotaoSecundario } from "./campos";

const TEXTO_STATUS = {
  inativa: "Sem assinatura",
  pendente: "Aguardando pagamento",
  ativa: "Ativa",
  cancelada: "Cancelada",
} as const;

const dataBR = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

export default function MinhaConta() {
  const router = useRouter();
  const parametros = useSearchParams();
  const { oficina, recarregar, erro: erroOficina } = useOficina();
  const [email, setEmail] = useState("");
  const [anual, setAnual] = useState(parametros.get("ciclo") === "anual");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const sincronizou = useRef(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  // Voltou do Mercado Pago: confere o pagamento sem esperar o webhook.
  useEffect(() => {
    if (parametros.get("retorno") !== "1" || sincronizou.current) return;
    sincronizou.current = true;
    setAviso("Conferindo seu pagamento...");
    fetch("/api/assinatura/sincronizar", { method: "POST" })
      .then((r) => r.json())
      .then((r) =>
        setAviso(
          r.status === "ativa"
            ? "Pagamento aprovado! Seu plano já está liberado."
            : r.status === "pendente"
              ? "Pagamento em análise. Assim que o Mercado Pago aprovar, seu plano é liberado."
              : "",
        ),
      )
      .catch(() => setAviso(""))
      .finally(() => {
        recarregar();
        router.replace("/painel/conta");
      });
  }, [parametros, recarregar, router]);

  async function assinar(plano: string) {
    setOcupado(plano);
    setErro("");
    const resposta = await fetch("/api/assinatura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plano, ciclo: anual ? "anual" : "mensal" }),
    });
    const corpo = await resposta.json().catch(() => ({}));
    if (resposta.ok && corpo.url) {
      window.location.href = corpo.url;
      return;
    }
    setErro(corpo.erro ?? "Não foi possível abrir o pagamento. Tente de novo.");
    setOcupado(null);
  }

  async function cancelar() {
    if (
      !window.confirm(
        "Cancelar a assinatura? Você continua usando o plano até o fim do período já pago.",
      )
    )
      return;
    setOcupado("cancelar");
    setErro("");
    const resposta = await fetch("/api/assinatura/cancelar", { method: "POST" });
    const corpo = await resposta.json().catch(() => ({}));
    if (!resposta.ok) setErro(corpo.erro ?? "Não foi possível cancelar. Tente de novo.");
    else setAviso("Assinatura cancelada. Nenhuma nova cobrança será feita.");
    await recarregar();
    setOcupado(null);
  }

  async function sair() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (erroOficina) return <p role="alert" className="text-danger">{erroOficina}</p>;
  if (oficina === undefined) return <p className="text-muted">Carregando...</p>;

  const a = oficina?.assinatura;
  const ativa = a ? temAssinaturaAtiva(a) : false;
  const planoAtual = PLANOS.find((p) => p.id === (ativa ? a!.plano : "gratis"))!;
  const destacar = parametros.get("plano");

  return (
    <>
      <section className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Minha conta</h1>
        {email && <p className="text-muted">{email}</p>}
      </section>

      {aviso && (
        <p role="status" className="rounded-xl bg-accent/10 p-3">
          {aviso}
        </p>
      )}
      {erro && (
        <p role="alert" className="rounded-xl bg-danger/10 p-3 text-danger">
          {erro}
        </p>
      )}

      {!oficina ? (
        <p className="text-muted">
          Primeiro cadastre sua oficina.{" "}
          <Link href="/painel" className="font-semibold text-accent">
            Cadastrar agora
          </Link>
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-xl font-semibold">Plano {planoAtual.nome}</h2>
            <dl className="grid gap-1 text-muted">
              <div className="flex gap-2">
                <dt>Situação:</dt>
                <dd className="font-medium text-foreground">{TEXTO_STATUS[a!.status]}</dd>
              </div>
              {ativa && a!.ciclo && (
                <div className="flex gap-2">
                  <dt>Cobrança:</dt>
                  <dd className="text-foreground">{a!.ciclo === "anual" ? "Anual" : "Mensal"}</dd>
                </div>
              )}
              {ativa && a!.fim && (
                <div className="flex gap-2">
                  <dt>{a!.status === "cancelada" ? "Vale até:" : "Próxima cobrança:"}</dt>
                  <dd className="text-foreground">{dataBR(a!.fim)}</dd>
                </div>
              )}
              {!ativa && (
                <div className="flex gap-2">
                  <dt>Orçamentos grátis usados:</dt>
                  <dd className="text-foreground">
                    {Math.min(a!.orcamentosCriados, LIMITE_GRATIS)} de {LIMITE_GRATIS}
                  </dd>
                </div>
              )}
            </dl>
            {ativa && a!.status === "ativa" && (
              <button
                type="button"
                onClick={cancelar}
                disabled={ocupado !== null}
                className="self-start text-sm font-medium text-danger underline-offset-4 hover:underline"
              >
                {ocupado === "cancelar" ? "Cancelando..." : "Cancelar assinatura"}
              </button>
            )}
          </section>

          {!(ativa && a!.status === "ativa") && (
            <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">Assinar um plano</h2>
              <div
                role="group"
                aria-label="Forma de cobrança"
                className="grid w-full max-w-sm grid-cols-2 gap-1 rounded-2xl border border-border bg-surface p-1"
              >
                {[false, true].map((opcao) => (
                  <button
                    key={String(opcao)}
                    type="button"
                    aria-pressed={anual === opcao}
                    onClick={() => setAnual(opcao)}
                    className={`h-11 rounded-xl text-sm font-medium transition-colors ${
                      anual === opcao
                        ? "bg-accent text-accent-foreground sombra-botao"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {opcao ? `Anual (${12 - MESES_PAGOS_NO_ANO} meses grátis)` : "Mensal"}
                  </button>
                ))}
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {PLANOS.filter((p) => p.precoMensal > 0).map((p) => (
                  <li
                    key={p.id}
                    className={`flex flex-col gap-4 rounded-2xl border p-5 ${
                      destacar === p.id || (!destacar && p.destaque)
                        ? "border-accent bg-accent/10 ring-1 ring-accent"
                        : "border-border bg-surface"
                    }`}
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{p.nome}</h3>
                      <p className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold tracking-tight tabular-nums">
                          {formatarPreco(precoPorMes(p, anual))}
                        </span>
                        <span className="text-muted">/mês</span>
                      </p>
                      {anual && (
                        <p className="text-sm text-muted">
                          {formatarPreco(p.precoMensal * MESES_PAGOS_NO_ANO)} por ano
                        </p>
                      )}
                    </div>
                    <ul className="flex flex-1 flex-col gap-2">
                      {p.recursos.map((r) => (
                        <li key={r} className="flex gap-2 text-sm">
                          <Check size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                          {r}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => assinar(p.id)}
                      disabled={ocupado !== null}
                      className={
                        destacar === p.id || (!destacar && p.destaque)
                          ? estiloBotaoPrincipal
                          : estiloBotaoSecundario
                      }
                    >
                      {ocupado === p.id ? "Abrindo pagamento..." : `Assinar ${p.nome}`}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted">
                O pagamento é feito no Mercado Pago, com cartão de crédito. Você pode
                cancelar quando quiser.
              </p>
            </section>
          )}
        </>
      )}

      <button type="button" onClick={sair} className={`${estiloBotaoSecundario} mt-4`}>
        Sair da conta
      </button>
    </>
  );
}
