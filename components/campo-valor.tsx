"use client";

import { useState } from "react";

// Campo numérico que aceita vírgula ("12,50") e deixa o usuário apagar
// e digitar à vontade; só repassa o valor quando ele é um número válido.
export default function CampoValor({
  rotulo,
  valor,
  onChange,
  prefixo,
  sufixo,
}: {
  rotulo: string;
  valor: number;
  onChange: (valor: number) => void;
  prefixo?: string;
  sufixo?: string;
}) {
  const [texto, setTexto] = useState(
    (prefixo === "R$" ? valor.toFixed(2) : String(valor)).replace(".", ","),
  );

  return (
    <label className="flex items-center justify-between gap-3 text-sm text-muted">
      <span className={rotulo ? undefined : "sr-only"}>{rotulo || "Preço"}</span>
      <span className="flex h-12 w-36 shrink-0 items-center gap-1 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-accent">
        {prefixo && <span>{prefixo}</span>}
        <input
          inputMode="decimal"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            const numero = Number(e.target.value.replace(",", "."));
            if (e.target.value.trim() !== "" && Number.isFinite(numero) && numero >= 0) {
              onChange(numero);
            }
          }}
          className="w-full min-w-0 bg-transparent text-right text-base text-foreground tabular-nums outline-none"
        />
        {sufixo && <span>{sufixo}</span>}
      </span>
    </label>
  );
}
