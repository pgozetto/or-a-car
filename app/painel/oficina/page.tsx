"use client";

import { useState } from "react";
import FormOficina from "@/components/form-oficina";
import MeusServicos from "@/components/meus-servicos";
import { VALOR_HORA_REFERENCIA } from "@/lib/orcamento";
import { useOficina } from "@/lib/use-oficina";

export default function PaginaOficina() {
  const { oficina, recarregar, erro } = useOficina();
  const [salvo, setSalvo] = useState(false);

  if (erro) return <p role="alert" className="text-danger">{erro}</p>;
  if (oficina === undefined) return <p className="text-muted">Carregando...</p>;

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Dados da oficina</h1>
      <FormOficina
        inicial={oficina}
        textoBotao="Salvar"
        aoSalvar={() => {
          recarregar();
          setSalvo(true);
        }}
      />
      {salvo && (
        <p role="status" className="text-center text-accent">
          Dados salvos.
        </p>
      )}
      {oficina && (
        <>
          <hr className="border-border" />
          <MeusServicos valorHora={oficina.valorHora ?? VALOR_HORA_REFERENCIA.padrao} />
        </>
      )}
    </>
  );
}
