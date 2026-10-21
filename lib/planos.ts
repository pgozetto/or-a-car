export type Plano = {
  id: "gratis" | "oficina" | "pro";
  nome: string;
  precoMensal: number;
  resumo: string;
  recursos: string[];
  destaque?: boolean;
};

// Plano anual: paga 10 meses e leva 12.
export const MESES_PAGOS_NO_ANO = 10;

// Total de orçamentos do plano grátis. Não renova: é só para experimentar.
export const LIMITE_GRATIS = 3;

export const PLANOS: Plano[] = [
  {
    id: "gratis",
    nome: "Grátis",
    precoMensal: 0,
    resumo: "Para experimentar antes de assinar.",
    recursos: [
      `${LIMITE_GRATIS} orçamentos para testar (não renova)`,
      "Envio pelo WhatsApp",
      "Preço por tipo e marca do carro",
    ],
  },
  {
    id: "oficina",
    nome: "Oficina",
    precoMensal: 49,
    resumo: "Para a oficina que orça todo dia.",
    destaque: true,
    recursos: [
      "Orçamentos ilimitados",
      "PDF com o nome da oficina",
      "Histórico de clientes e orçamentos",
      "Aparece na busca de oficinas da região",
    ],
  },
  {
    id: "pro",
    nome: "Oficina Pro",
    precoMensal: 99,
    resumo: "Para quem tem equipe.",
    recursos: [
      "Tudo do plano Oficina",
      "Até 3 pessoas usando",
      "Relatório de orçamentos aprovados",
      "Destaque na busca da região",
    ],
  },
];

export function precoPorMes(plano: Plano, anual: boolean) {
  return anual
    ? (plano.precoMensal * MESES_PAGOS_NO_ANO) / 12
    : plano.precoMensal;
}

export const formatarPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
    maximumFractionDigits: 2,
  });
