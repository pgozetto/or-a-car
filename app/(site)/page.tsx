import Link from "next/link";
import {
  CarProfile,
  CursorClick,
  DeviceMobile,
  ListChecks,
  WhatsappLogo,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import PreviaOrcamento from "@/components/site/previa-orcamento";
import Perguntas from "@/components/site/perguntas";
import { estiloBotaoPrincipal, estiloBotaoSecundario } from "@/components/campos";
import { PLANOS, formatarPreco } from "@/lib/planos";
import { TIPOS_VEICULO } from "@/lib/orcamento";

const PASSOS = [
  {
    icone: CarProfile,
    titulo: "Escolha o carro",
    texto: "Tipo e marca. O sistema já ajusta o tempo de serviço e o preço das peças.",
  },
  {
    icone: CursorClick,
    titulo: "Toque nos serviços",
    texto: "Troca de óleo, freio, embreagem, revisão. O total aparece na hora.",
  },
  {
    icone: WhatsappLogo,
    titulo: "Mande pelo WhatsApp",
    texto: "O cliente recebe peça por peça e a mão de obra, tudo explicado.",
  },
];

const menorPrecoPago = Math.min(
  ...PLANOS.filter((p) => p.precoMensal > 0).map((p) => p.precoMensal),
);

export default function Landing() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
            Orçamento de oficina pronto em um minuto
          </h1>
          <p className="max-w-[46ch] text-lg leading-relaxed text-muted">
            Escolha o carro, toque nos serviços e mande o preço pelo WhatsApp.
            Sem planilha, sem conta de cabeça.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/painel" className={estiloBotaoPrincipal}>
              Começar grátis
            </Link>
            <Link href="/planos" className={estiloBotaoSecundario}>
              Ver planos
            </Link>
          </div>
        </div>
        <PreviaOrcamento />
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight md:text-4xl">
            Três toques e o orçamento está na mão do cliente
          </h2>
          <ol className="mt-12 flex flex-col">
            {PASSOS.map(({ icone: Icone, titulo, texto }) => (
              <li
                key={titulo}
                className="grid gap-3 border-t border-border py-8 md:grid-cols-[auto_1fr_1.4fr] md:items-center md:gap-10"
              >
                <Icone size={36} weight="duotone" className="text-accent" />
                <p className="text-2xl font-semibold tracking-tight">{titulo}</p>
                <p className="max-w-[48ch] text-muted">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight md:text-4xl">
          Feito para quem vive dentro da oficina
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
          <article className="flex flex-col justify-between gap-8 rounded-2xl border border-border bg-surface p-6 md:col-span-2 md:row-span-2">
            <div className="flex flex-col gap-3">
              <Wrench size={32} weight="duotone" className="text-accent" />
              <h3 className="text-2xl font-semibold tracking-tight">
                Preço certo para cada carro
              </h3>
              <p className="max-w-[52ch] text-muted">
                Trocar a embreagem de uma picape não é igual a de um hatch. O
                OrçaCar ajusta o tempo de serviço pelo tipo e o preço das peças
                pela marca. Você sempre pode mudar qualquer valor.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {TIPOS_VEICULO.map((t) => (
                <li
                  key={t.id}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm"
                >
                  {t.nome}
                  {t.fatorHoras > 1 && (
                    <span className="text-muted">
                      {" "}
                      +{Math.round((t.fatorHoras - 1) * 100)}% de tempo
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </article>
          <article className="flex flex-col gap-3 rounded-2xl bg-accent p-6 text-accent-foreground">
            <ListChecks size={32} weight="duotone" />
            <h3 className="text-xl font-semibold tracking-tight">Cada peça com seu preço</h3>
            <p>
              O cliente vê peça por peça e a mão de obra. Menos discussão, mais
              orçamento aprovado.
            </p>
          </article>
          <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-6">
            <DeviceMobile size={32} weight="duotone" className="text-accent" />
            <h3 className="text-xl font-semibold tracking-tight">Funciona no celular</h3>
            <p className="text-muted">
              Não precisa instalar nada nem ter computador. Abre no navegador do
              celular.
            </p>
          </article>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[30ch] text-2xl font-semibold tracking-tight md:text-3xl">
            Comece grátis. Planos a partir de {formatarPreco(menorPrecoPago)} por mês.
          </p>
          <Link href="/planos" className={estiloBotaoSecundario}>
            Ver planos
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col items-start gap-6">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Perguntas comuns
          </h2>
          <Link href="/painel" className={estiloBotaoPrincipal}>
            Começar grátis
          </Link>
        </div>
        <Perguntas
          itens={[
            {
              pergunta: "Preciso instalar alguma coisa?",
              resposta:
                "Não. O OrçaCar abre no navegador do celular ou do computador. Se quiser, dá para colocar um atalho na tela inicial do celular.",
            },
            {
              pergunta: "De onde vêm os preços das peças?",
              resposta:
                "Partimos de uma tabela de referência para carro popular e ajustamos pelo tipo e pela marca. Você pode mudar qualquer valor antes de enviar, e o valor da sua hora é você quem define.",
            },
            {
              pergunta: "O cliente precisa ter o aplicativo?",
              resposta:
                "Não. Ele recebe o orçamento como uma mensagem normal no WhatsApp. Se preferir, você imprime ou salva em PDF.",
            },
            {
              pergunta: "Posso cancelar quando quiser?",
              resposta:
                "Pode. Sem multa e sem fidelidade. Se cancelar, seus orçamentos continuam salvos para consulta.",
            },
          ]}
        />
      </section>
    </>
  );
}
