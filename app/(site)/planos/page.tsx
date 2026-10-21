import type { Metadata } from "next";
import Perguntas from "@/components/site/perguntas";
import TabelaPlanos from "@/components/site/tabela-planos";
import { LIMITE_GRATIS } from "@/lib/planos";

export const metadata: Metadata = {
  title: "Planos | OrçaCar",
  description: "Comece grátis. Planos para oficinas a partir de R$ 49 por mês.",
};

export default function PaginaPlanos() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-16 md:pt-20">
        <h1 className="max-w-[18ch] text-4xl leading-[1.05] font-semibold tracking-tight md:text-5xl">
          Um plano para cada tamanho de oficina
        </h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted">
          Comece grátis e mude de plano quando quiser. Sem fidelidade.
        </p>
        <TabelaPlanos />
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 border-t border-border px-4 py-20 md:grid-cols-[1fr_1.6fr]">
        <h2 className="text-3xl font-semibold tracking-tight">Sobre o pagamento</h2>
        <Perguntas
          itens={[
            {
              pergunta: "Como eu pago?",
              resposta:
                "Pix ou cartão de crédito. No cartão a cobrança é automática todo mês (ou todo ano, no plano anual).",
            },
            {
              pergunta: `O que acontece depois dos ${LIMITE_GRATIS} orçamentos grátis?`,
              resposta:
                "Seus orçamentos continuam salvos e você pode ver e reenviar todos. Para criar novos, é só assinar um plano. O plano grátis não renova todo mês.",
            },
            {
              pergunta: "Posso trocar de plano depois?",
              resposta:
                "Pode subir ou descer de plano a qualquer momento. A diferença é ajustada na próxima cobrança.",
            },
            {
              pergunta: "Tem nota fiscal?",
              resposta: "Sim, enviamos a nota fiscal por e-mail a cada pagamento.",
            },
          ]}
        />
      </section>
    </>
  );
}
