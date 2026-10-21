"use client";

import { useEffect, useState } from "react";
import { lerOficina, type Oficina } from "./armazenamento";

// undefined = ainda carregando; null = oficina não cadastrada.
export function useOficina() {
  const [oficina, setOficina] = useState<Oficina | null | undefined>(undefined);
  useEffect(() => setOficina(lerOficina()), []);
  return [oficina, setOficina] as const;
}
