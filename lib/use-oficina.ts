"use client";

import { useCallback, useEffect, useState } from "react";
import { lerOficina, type OficinaCompleta } from "./armazenamento";

// undefined = ainda carregando; null = oficina não cadastrada.
export function useOficina() {
  const [oficina, setOficina] = useState<OficinaCompleta | null | undefined>(undefined);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    try {
      setOficina(await lerOficina());
      setErro("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar a oficina.");
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { oficina, recarregar, erro };
}
