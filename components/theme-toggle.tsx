"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [claro, setClaro] = useState(false);

  useEffect(() => {
    setClaro(document.documentElement.dataset.theme === "light");
  }, []);

  function alternar() {
    const proximo = !claro;
    setClaro(proximo);
    if (proximo) document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("tema", proximo ? "light" : "dark");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className="h-12 rounded-full border border-border px-4 text-sm text-muted transition-colors hover:text-foreground"
    >
      {claro ? "Modo escuro" : "Modo claro"}
    </button>
  );
}
