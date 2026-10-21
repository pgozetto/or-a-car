"use client";

import { useState } from "react";

// O site sempre abre no modo claro; a troca vale só até recarregar a página.
export default function ThemeToggle() {
  const [escuro, setEscuro] = useState(false);

  function alternar() {
    const proximo = !escuro;
    setEscuro(proximo);
    if (proximo) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className="h-12 rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground sombra-botao-leve transition-colors hover:bg-surface-2"
    >
      {escuro ? "Modo claro" : "Modo escuro"}
    </button>
  );
}
