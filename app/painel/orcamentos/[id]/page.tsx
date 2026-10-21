"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  atualizarStatus,
  buscarOrcamento,
  linkWhatsApp,
  type OrcamentoSalvo,
  type StatusOrcamento,
} from "@/lib/armazenamento";
import {
  calcularOrcamento,
  descreverVeiculo,
  formatarReais,
  textoWhatsApp,
} from "@/lib/orcamento";
import { useOficina } from "@/lib/use-oficina";
import { ROTULO_STATUS } from "@/components/status";
import { estiloBotaoPrincipal } from "@/components/campos";

export default function PaginaOrcamento() {
  const { id } = useParams<{ id: string }>();
  const [oficina] = useOficina();
  const [orcamento, setOrcamento] = useState<OrcamentoSalvo | null | undefined>();
  useEffect(() => setOrcamento(buscarOrcamento(id)), [id]);

  if (orcamento === undefined || oficina === undefined) return null;

  if (orcamento === null) {
    return (
      <p className="text-muted">
        Orçamento não encontrado.{" "}
        <Link href="/painel/orcamentos" className="text-accent">
          Ver todos
        </Link>
      </p>
    );
  }

  const resultado = calcularOrcamento({
    itens: orcamento.itens,
    valorHora: orcamento.valorHora,
    veiculo: orcamento.veiculo,
    descontoPct: orcamento.descontoPct,
  });
  const veiculo = descreverVeiculo(orcamento.veiculo, orcamento.modelo);

  function mudarStatus(status: StatusOrcamento) {
    atualizarStatus(id, status);
    setOrcamento((o) => o && { ...o, status });
  }

  return (
    <>
      <article className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 print:border-0 print:bg-transparent print:p-0">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-muted">{oficina?.nome ?? "Oficina"}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Orçamento</h1>
          <p className="text-sm text-muted">
            {new Date(orcamento.criadoEm).toLocaleDateString("pt-BR")} · nº{" "}
            {orcamento.id}
          </p>
        </header>

        <dl className="grid gap-1 text-sm">
          {orcamento.cliente && (
            <div className="flex gap-2">
              <dt className="text-muted">Cliente:</dt>
              <dd>{orcamento.cliente}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-muted">Veículo:</dt>
            <dd>{veiculo}</dd>
          </div>
        </dl>

        <ul className="flex flex-col divide-y divide-border">
          {resultado.linhas.map((l) => (
            <li key={l.servicoId} className="flex flex-col gap-1 py-3">
              <div className="flex justify-between gap-3 font-medium">
                <span>{l.nome}</span>
                <span className="tabular-nums">{formatarReais(l.total)}</span>
              </div>
              {l.pecas.map((p) => (
                <div key={p.nome} className="flex justify-between gap-3 text-sm text-muted">
                  <span>{p.nome}</span>
                  <span className="tabular-nums">{formatarReais(p.preco)}</span>
                </div>
              ))}
              <div className="flex justify-between gap-3 text-sm text-muted">
                <span>Mão de obra ({l.horas} h)</span>
                <span className="tabular-nums">{formatarReais(l.maoDeObra)}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-1 border-t border-border pt-4">
          {resultado.desconto > 0 && (
            <div className="flex justify-between text-sm text-muted">
              <span>Desconto ({orcamento.descontoPct}%)</span>
              <span className="tabular-nums">-{formatarReais(resultado.desconto)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatarReais(resultado.total)}</span>
          </div>
        </div>
      </article>

      <div className="flex flex-col gap-4 print:hidden">
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Situação">
          {(Object.keys(ROTULO_STATUS) as StatusOrcamento[]).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={orcamento.status === s}
              onClick={() => mudarStatus(s)}
              className={`h-12 rounded-xl border text-sm font-medium transition-colors ${
                orcamento.status === s
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {ROTULO_STATUS[s].texto}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={linkWhatsApp(
              textoWhatsApp(oficina?.nome ?? "Oficina", resultado, veiculo),
              orcamento.telefoneCliente,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={estiloBotaoPrincipal}
          >
            Reenviar WhatsApp
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-14 items-center justify-center rounded-2xl border border-border font-semibold transition-colors hover:bg-surface-2"
          >
            Imprimir / salvar PDF
          </button>
        </div>
      </div>
    </>
  );
}
