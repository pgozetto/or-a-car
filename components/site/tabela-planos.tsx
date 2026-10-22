"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import { estiloBotaoPrincipal, estiloBotaoSecundario } from "@/components/campos";
import {
  MESES_PAGOS_NO_ANO,
  PLANOS,
  formatarPreco,
  precoPorMes,
} from "@/lib/planos";

export default function TabelaPlanos() {
  const [anual, setAnual] = useState(false);

  return (
    <div className="mt-10 flex flex-col gap-8">
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

      <ul className="grid gap-4 md:grid-cols-3">
        {PLANOS.map((p) => {
          const preco = precoPorMes(p, anual);
          return (
            <li
              key={p.id}
              className={`flex flex-col gap-6 rounded-2xl border p-6 ${
                p.destaque
                  ? "border-accent bg-accent/10 ring-1 ring-accent"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{p.nome}</h2>
                  {p.destaque && (
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      Mais escolhido
                    </span>
                  )}
                </div>
                <p className="text-muted">{p.resumo}</p>
              </div>

              <div>
                <p className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight tabular-nums">
                    {formatarPreco(preco)}
                  </span>
                  {p.precoMensal > 0 && <span className="text-muted">/mês</span>}
                </p>
                <p className="mt-1 h-5 text-sm text-muted">
                  {p.precoMensal > 0 && anual
                    ? `${formatarPreco(p.precoMensal * MESES_PAGOS_NO_ANO)} cobrados uma vez por ano`
                    : p.precoMensal > 0
                      ? "Cobrado todo mês"
                      : "Sem cartão de crédito"}
                </p>
              </div>

              <ul className="flex flex-1 flex-col gap-3">
                {p.recursos.map((r) => (
                  <li key={r} className="flex gap-3">
                    <Check size={20} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                    {r}
                  </li>
                ))}
              </ul>

              <Link
                href={p.precoMensal === 0 ? "/entrar?modo=criar" : `/painel/conta?plano=${p.id}${anual ? "&ciclo=anual" : ""}`}
                className={p.destaque ? estiloBotaoPrincipal : estiloBotaoSecundario}
              >
                {p.precoMensal === 0 ? "Começar grátis" : `Assinar ${p.nome}`}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
