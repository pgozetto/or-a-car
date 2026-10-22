"use client";

import FormOficina from "@/components/form-oficina";
import NovoOrcamento from "@/components/novo-orcamento";
import { useOficina } from "@/lib/use-oficina";

export default function Home() {
  const { oficina, recarregar, erro } = useOficina();

  if (erro) return <p role="alert" className="text-danger">{erro}</p>;
  if (oficina === undefined) return <p className="text-muted">Carregando...</p>;

  if (oficina === null) {
    return (
      <>
        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Bem-vindo! Vamos configurar sua oficina
          </h1>
          <p className="mt-2 text-muted">Leva menos de um minuto.</p>
        </section>
        <FormOficina aoSalvar={recarregar} textoBotao="Começar a fazer orçamentos" />
      </>
    );
  }

  return (
    <>
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Novo orçamento</h1>
        <p className="mt-2 text-muted">Escolha o carro e os serviços. O valor sai na hora.</p>
      </section>
      <NovoOrcamento oficina={oficina} />
    </>
  );
}
