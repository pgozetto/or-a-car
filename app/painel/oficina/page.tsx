"use client";

import { useState } from "react";
import FormOficina from "@/components/form-oficina";
import { useOficina } from "@/lib/use-oficina";

export default function PaginaOficina() {
  const [oficina, setOficina] = useOficina();
  const [salvo, setSalvo] = useState(false);

  if (oficina === undefined) return null;

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Dados da oficina</h1>
      <FormOficina
        inicial={oficina}
        textoBotao="Salvar"
        aoSalvar={(o) => {
          setOficina(o);
          setSalvo(true);
        }}
      />
      {salvo && (
        <p role="status" className="text-center text-accent">
          Dados salvos.
        </p>
      )}
    </>
  );
}
