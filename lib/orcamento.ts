import servicosBase from "@/data/servicos-base.json";
import regioes from "@/data/regioes.json";
import veiculos from "@/data/veiculos.json";

export type Peca = {
  nome: string;
  precoPadrao: number;
  precoMin: number;
  precoMax: number;
};

export type Servico = {
  id: string;
  nome: string;
  categoria: string;
  horasPadrao: number;
  pecas: Peca[];
  // Serviço criado pela oficina: horas e preços valem para qualquer carro.
  fixo?: boolean;
};

export const CATEGORIAS: Record<string, string> = {
  revisao: "Revisão",
  freios: "Freios",
  suspensao: "Suspensão",
  motor: "Motor",
  transmissao: "Transmissão",
  eletrica: "Elétrica e ar",
  carroceria: "Vidros e retrovisores",
  oficina: "Serviços da sua oficina",
};

export type FatorVeiculo = {
  id: string;
  nome: string;
  fatorHoras: number;
  fatorPecas: number;
};

export type Veiculo = { tipoId: string; marcaId: string };

export type ItemOrcamento = {
  servicoId: string;
  // Ajustes feitos pela oficina neste orçamento específico.
  horas?: number;
  precosPecas?: Record<string, number>;
};

export type EntradaOrcamento = {
  itens: ItemOrcamento[];
  valorHora: number;
  veiculo?: Veiculo;
  fatorRegional?: number;
  descontoPct?: number;
};

export type LinhaOrcamento = {
  servicoId: string;
  nome: string;
  horas: number;
  maoDeObra: number;
  pecas: { nome: string; preco: number }[];
  totalPecas: number;
  total: number;
};

export type ResultadoOrcamento = {
  linhas: LinhaOrcamento[];
  totalMaoDeObra: number;
  totalPecas: number;
  subtotal: number;
  desconto: number;
  total: number;
};

export const SERVICOS: Servico[] = servicosBase.servicos;
export const VALOR_HORA_REFERENCIA = servicosBase.valorHoraReferencia;
export const TIPOS_VEICULO: FatorVeiculo[] = veiculos.tipos;
export const MARCAS: FatorVeiculo[] = veiculos.marcas;
const HORAS_POR_TIPO = veiculos.horasPorTipo as Record<
  string,
  Record<string, number>
>;

const NEUTRO: FatorVeiculo = { id: "", nome: "", fatorHoras: 1, fatorPecas: 1 };

// Trabalhar em centavos evita erros de ponto flutuante nas somas.
const centavos = (valor: number) => Math.round(valor * 100);
const reais = (c: number) => c / 100;

export function fatorRegional(
  uf: string,
  tipo: "capital" | "interior",
): number {
  const porUf = regioes.porUf as Record<
    string,
    { capital: number; interior: number }
  >;
  return (porUf[uf.toUpperCase()] ?? regioes.padrao)[tipo];
}

function fatoresVeiculo(veiculo?: Veiculo) {
  return {
    tipo: TIPOS_VEICULO.find((t) => t.id === veiculo?.tipoId) ?? NEUTRO,
    marca: MARCAS.find((m) => m.id === veiculo?.marcaId) ?? NEUTRO,
  };
}

// Horas arredondadas para o quarto de hora mais próximo, como a oficina cobra.
export function horasSugeridas(servico: Servico, veiculo?: Veiculo): number {
  if (servico.fixo) return servico.horasPadrao;
  const { tipo, marca } = fatoresVeiculo(veiculo);
  const especifica = HORAS_POR_TIPO[servico.id]?.[tipo.id];
  const base = especifica ?? servico.horasPadrao * tipo.fatorHoras;
  return Math.round(base * marca.fatorHoras * 4) / 4;
}

export function precoSugeridoPeca(peca: Peca, veiculo?: Veiculo): number {
  const { tipo, marca } = fatoresVeiculo(veiculo);
  return reais(centavos(peca.precoPadrao * tipo.fatorPecas * marca.fatorPecas));
}

export function calcularOrcamento(
  entrada: EntradaOrcamento,
  servicos: Servico[] = SERVICOS,
): ResultadoOrcamento {
  const fator = entrada.fatorRegional ?? 1;
  const descontoPct = Math.min(Math.max(entrada.descontoPct ?? 0, 0), 100);
  const valorHoraCentavos = centavos(entrada.valorHora * fator);

  const linhas = entrada.itens.map((item) => {
    const servico = servicos.find((s) => s.id === item.servicoId);
    if (!servico) throw new Error(`Serviço desconhecido: ${item.servicoId}`);

    const horas = item.horas ?? horasSugeridas(servico, entrada.veiculo);
    const maoDeObra = Math.round(horas * valorHoraCentavos);
    const pecas = servico.pecas.map((p) => ({
      nome: p.nome,
      preco: centavos(
        item.precosPecas?.[p.nome] ??
          (servico.fixo ? p.precoPadrao : precoSugeridoPeca(p, entrada.veiculo)),
      ),
    }));
    const totalPecas = pecas.reduce((soma, p) => soma + p.preco, 0);

    return {
      servicoId: servico.id,
      nome: servico.nome,
      horas,
      maoDeObra,
      pecas,
      totalPecas,
      total: maoDeObra + totalPecas,
    };
  });

  const totalMaoDeObra = linhas.reduce((s, l) => s + l.maoDeObra, 0);
  const totalPecas = linhas.reduce((s, l) => s + l.totalPecas, 0);
  const subtotal = totalMaoDeObra + totalPecas;
  const desconto = Math.round((subtotal * descontoPct) / 100);

  return {
    linhas: linhas.map((l) => ({
      ...l,
      maoDeObra: reais(l.maoDeObra),
      pecas: l.pecas.map((p) => ({ ...p, preco: reais(p.preco) })),
      totalPecas: reais(l.totalPecas),
      total: reais(l.total),
    })),
    totalMaoDeObra: reais(totalMaoDeObra),
    totalPecas: reais(totalPecas),
    subtotal: reais(subtotal),
    desconto: reais(desconto),
    total: reais(subtotal - desconto),
  };
}

export const formatarReais = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function descreverVeiculo(veiculo?: Veiculo, modelo?: string): string {
  if (!veiculo) return "";
  const { tipo, marca } = fatoresVeiculo(veiculo);
  return [marca.nome, modelo, tipo.nome && `(${tipo.nome})`]
    .filter(Boolean)
    .join(" ");
}

export function textoWhatsApp(
  oficina: string,
  resultado: ResultadoOrcamento,
  veiculo = "",
): string {
  const linhas = resultado.linhas.flatMap((l) => [
    `• ${l.nome}: ${formatarReais(l.total)}`,
    ...l.pecas.map((p) => `   - ${p.nome}: ${formatarReais(p.preco)}`),
    `   - Mão de obra (${l.horas} h): ${formatarReais(l.maoDeObra)}`,
  ]);
  const desconto =
    resultado.desconto > 0
      ? [`Desconto: -${formatarReais(resultado.desconto)}`]
      : [];
  return [
    `*Orçamento — ${oficina}*`,
    ...(veiculo ? [`Veículo: ${veiculo}`] : []),
    "",
    ...linhas,
    "",
    ...desconto,
    `*Total: ${formatarReais(resultado.total)}*`,
  ].join("\n");
}
