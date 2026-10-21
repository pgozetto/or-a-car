import Link from "next/link";
import {
  CaretDown,
  CheckCircle,
  CurrencyCircleDollar,
  DeviceMobile,
  FilePdf,
  Gear,
  MoonStars,
  PlusCircle,
  Receipt,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

type Tutorial = {
  titulo: string;
  icone: Icon;
  passos: string[];
  dica?: string;
  acao?: { rotulo: string; href: string };
};

const TUTORIAIS: Tutorial[] = [
  {
    titulo: "Configurar sua oficina",
    icone: Gear,
    passos: [
      "Toque na aba Oficina, no alto da tela.",
      "Escreva o nome da oficina e o seu WhatsApp.",
      "Escolha o estado e se a oficina fica na capital ou no interior.",
      "Confira o valor da sua hora de trabalho. O OrçaCar sugere um valor para a sua região, mas você pode mudar.",
      "Toque em Salvar.",
    ],
    dica: "O valor da hora é usado em todos os orçamentos. Se mudar o preço da hora, os próximos orçamentos já saem com o valor novo.",
    acao: { rotulo: "Abrir dados da oficina", href: "/painel/oficina" },
  },
  {
    titulo: "Fazer seu primeiro orçamento",
    icone: Receipt,
    passos: [
      "Toque na aba Novo.",
      "Escolha o tipo do carro: hatch, sedã, SUV, picape ou van.",
      "Escolha a marca do carro na lista. Se quiser, escreva o modelo e o ano.",
      "Toque nos serviços que vai fazer. Pode escolher mais de um.",
      "O total aparece embaixo da tela na mesma hora.",
    ],
    dica: "O tipo e a marca mudam o preço: um SUV leva mais tempo de serviço e algumas marcas têm peças mais caras.",
    acao: { rotulo: "Fazer um orçamento", href: "/painel" },
  },
  {
    titulo: "Adicionar um serviço da sua oficina",
    icone: PlusCircle,
    passos: [
      "Toque na aba Oficina e desça até Meus serviços.",
      "Em Nome do serviço, escreva o nome. Por exemplo: Polimento de farol.",
      "Em Tempo de serviço, digite quantas horas o serviço leva. O valor da mão de obra aparece ao lado, usando o preço da sua hora.",
      "Se o serviço usa peças, toque em Adicionar peça, escreva o nome da peça e o preço que você cobra. Repita para cada peça.",
      "Confira o Preço deste serviço e toque em Adicionar serviço.",
      "Pronto: o serviço aparece no Novo orçamento, no grupo Serviços da sua oficina.",
    ],
    dica: "Os serviços que você cria têm preço fixo: o tempo e as peças não mudam com o tipo ou a marca do carro. Para mudar, toque no lápis ao lado do serviço. Para apagar, toque na lixeira.",
    acao: { rotulo: "Adicionar um serviço", href: "/painel/oficina#servicos" },
  },
  {
    titulo: "Mudar o preço de uma peça ou as horas",
    icone: CurrencyCircleDollar,
    passos: [
      "Depois de escolher os serviços, desça até Peças e mão de obra.",
      "Cada peça aparece com um preço sugerido. Toque no valor e digite o preço que você paga.",
      "Para mudar o tempo de serviço, toque no número de horas e digite o novo valor.",
      "O total é recalculado sozinho.",
    ],
    dica: "Pode usar vírgula nos centavos, como 89,90.",
  },
  {
    titulo: "Enviar o orçamento pelo WhatsApp",
    icone: WhatsappLogo,
    passos: [
      "Em Para quem é?, escreva o nome e o WhatsApp do cliente (os dois são opcionais).",
      "Se for dar desconto, escreva a porcentagem no campo Desconto.",
      "Toque no botão azul Enviar WhatsApp, embaixo da tela.",
      "O WhatsApp abre com a mensagem pronta, peça por peça. É só tocar em enviar.",
    ],
    dica: "Se você não colocar o número do cliente, o WhatsApp deixa você escolher o contato na hora de enviar.",
  },
  {
    titulo: "Imprimir ou salvar em PDF",
    icone: FilePdf,
    passos: [
      "Toque na aba Orçamentos e abra o orçamento que quer imprimir.",
      "Toque em Imprimir / salvar PDF.",
      "Para imprimir, escolha a impressora. Para guardar o arquivo, escolha Salvar como PDF.",
    ],
    dica: "O orçamento impresso sai sempre em fundo branco, mesmo usando o modo escuro.",
    acao: { rotulo: "Ver orçamentos", href: "/painel/orcamentos" },
  },
  {
    titulo: "Marcar orçamento como aprovado ou recusado",
    icone: CheckCircle,
    passos: [
      "Toque na aba Orçamentos e abra o orçamento.",
      "Toque em Aprovado quando o cliente aceitar, ou em Recusado se ele não quiser.",
      "Na lista de orçamentos você vê a situação de cada um.",
    ],
  },
  {
    titulo: "Colocar o OrçaCar na tela do celular",
    icone: DeviceMobile,
    passos: [
      "No Android (Chrome): abra o OrçaCar, toque nos três pontinhos no canto de cima e escolha Adicionar à tela inicial.",
      "No iPhone (Safari): abra o OrçaCar, toque no botão de compartilhar (o quadrado com a seta) e escolha Adicionar à Tela de Início.",
      "Pronto: o OrçaCar aparece como um aplicativo na tela do celular.",
    ],
  },
  {
    titulo: "Trocar entre modo claro e modo escuro",
    icone: MoonStars,
    passos: [
      "Toque no botão Modo escuro, no canto de cima da tela.",
      "Para voltar, toque em Modo claro.",
    ],
    dica: "O OrçaCar sempre abre no modo claro, que é mais fácil de ler no sol.",
  },
];

export default function PaginaTutoriais() {
  return (
    <>
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Tutoriais</h1>
        <p className="mt-2 text-muted">
          Passo a passo para usar o OrçaCar. Toque em um assunto para abrir.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        {TUTORIAIS.map(({ titulo, icone: Icone, passos, dica, acao }) => (
          <details
            key={titulo}
            className="group rounded-2xl border border-border bg-surface open:border-accent"
          >
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-4 py-3 text-lg font-medium [&::-webkit-details-marker]:hidden">
              <Icone size={28} weight="duotone" className="shrink-0 text-accent" />
              <span className="flex-1">{titulo}</span>
              <CaretDown
                size={20}
                className="shrink-0 text-muted transition-transform duration-200 ease-out group-open:rotate-180"
              />
            </summary>

            <div className="flex flex-col gap-4 px-4 pb-5">
              <ol className="flex flex-col gap-3">
                {passos.map((passo, i) => (
                  <li key={passo} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{passo}</span>
                  </li>
                ))}
              </ol>
              {dica && (
                <p className="rounded-xl bg-background p-3 text-sm leading-relaxed text-muted">
                  <strong className="text-foreground">Dica: </strong>
                  {dica}
                </p>
              )}
              {acao && (
                <Link href={acao.href} className="self-start font-semibold text-accent">
                  {acao.rotulo} →
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
