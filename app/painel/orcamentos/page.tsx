"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listarOrcamentos, type OrcamentoSalvo } from "@/lib/armazenamento";
import { descreverVeiculo, formatarReais } from "@/lib/orcamento";
import { ROTULO_STATUS } from "@/components/status";

export default function PaginaOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoSalvo[] | null>(null);
  useEffect(() => setOrcamentos(listarOrcamentos()), []);

  if (orcamentos === null) return null;

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Orçamentos</h1>
      {orcamentos.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border p-6">
          <p className="text-muted">Você ainda não fez nenhum orçamento.</p>
          <Link href="/painel" className="font-semibold text-accent">
            Fazer o primeiro orçamento →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orcamentos.map((o) => (
            <li key={o.id}>
              <Link
                href={`/painel/orcamentos/${o.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {o.cliente || "Cliente sem nome"}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {descreverVeiculo(o.veiculo, o.modelo)} ·{" "}
                    {new Date(o.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold tabular-nums">{formatarReais(o.total)}</p>
                  <p className={`text-sm ${ROTULO_STATUS[o.status].cor}`}>
                    {ROTULO_STATUS[o.status].texto}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
