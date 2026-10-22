// Dados da oficina no Supabase. As regras de acesso (cada oficina só vê o
// que é dela, limite do plano grátis) ficam no banco, via RLS.
import { createClient } from "./supabase/client";
import type { ItemOrcamento, Servico, Veiculo } from "./orcamento";

export type Plano = "gratis" | "oficina" | "pro";
export type StatusAssinatura = "inativa" | "pendente" | "ativa" | "cancelada";

export type Oficina = {
  nome: string;
  whatsapp: string;
  uf: string;
  local: "capital" | "interior";
  valorHora: number;
};

// Campos que só o servidor altera (pagamento e contador do plano grátis).
export type Assinatura = {
  plano: Plano;
  status: StatusAssinatura;
  ciclo: "mensal" | "anual" | null;
  fim: string | null;
  orcamentosCriados: number;
};

export type OficinaCompleta = Oficina & { assinatura: Assinatura };

export type StatusOrcamento = "enviado" | "aprovado" | "recusado";

export type OrcamentoSalvo = {
  id: string;
  codigo: string;
  criadoEm: string;
  cliente: string;
  telefoneCliente: string;
  veiculo: Veiculo;
  modelo: string;
  itens: ItemOrcamento[];
  valorHora: number;
  descontoPct: number;
  total: number;
  status: StatusOrcamento;
  // Cópia dos serviços da oficina usados aqui, para o orçamento continuar
  // abrindo igual mesmo se o serviço for editado ou excluído depois.
  servicosDaOficina: Servico[];
};

// Lançado quando o banco recusa um orçamento novo por causa do plano grátis.
export class LimiteGratisAtingido extends Error {
  constructor() {
    super("Limite do plano grátis atingido");
  }
}

const supabase = () => createClient();

async function usuarioId() {
  const { data } = await supabase().auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre de novo.");
  return data.user.id;
}

function falhar(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

type LinhaOficina = {
  nome: string;
  whatsapp: string;
  uf: string;
  local: "capital" | "interior";
  valor_hora: number | string;
  plano: Plano;
  assinatura_status: StatusAssinatura;
  assinatura_ciclo: "mensal" | "anual" | null;
  assinatura_fim: string | null;
  orcamentos_criados: number;
};

export async function lerOficina(): Promise<OficinaCompleta | null> {
  const { data, error } = await supabase()
    .from("oficinas")
    .select(
      "nome, whatsapp, uf, local, valor_hora, plano, assinatura_status, assinatura_ciclo, assinatura_fim, orcamentos_criados",
    )
    .maybeSingle<LinhaOficina>();
  falhar(error);
  if (!data) return null;
  return {
    nome: data.nome,
    whatsapp: data.whatsapp,
    uf: data.uf,
    local: data.local,
    valorHora: Number(data.valor_hora),
    assinatura: {
      plano: data.plano,
      status: data.assinatura_status,
      ciclo: data.assinatura_ciclo,
      fim: data.assinatura_fim,
      orcamentosCriados: data.orcamentos_criados,
    },
  };
}

export async function salvarOficina(oficina: Oficina) {
  const { error } = await supabase()
    .from("oficinas")
    .upsert({
      id: await usuarioId(),
      nome: oficina.nome,
      whatsapp: oficina.whatsapp,
      uf: oficina.uf,
      local: oficina.local,
      valor_hora: oficina.valorHora,
    });
  falhar(error);
}

type LinhaServico = {
  id: string;
  nome: string;
  horas: number | string;
  pecas: { nome: string; preco: number }[];
};

const paraServico = (l: LinhaServico): Servico => ({
  id: l.id,
  nome: l.nome,
  categoria: "oficina",
  horasPadrao: Number(l.horas),
  fixo: true,
  pecas: l.pecas.map((p) => ({
    nome: p.nome,
    precoPadrao: p.preco,
    precoMin: p.preco,
    precoMax: p.preco,
  })),
});

export async function listarServicosDaOficina(): Promise<Servico[]> {
  const { data, error } = await supabase()
    .from("servicos_oficina")
    .select("id, nome, horas, pecas")
    .order("created_at")
    .returns<LinhaServico[]>();
  falhar(error);
  return (data ?? []).map(paraServico);
}

export async function salvarServicoDaOficina(dados: {
  id?: string;
  nome: string;
  horasPadrao: number;
  pecas: { nome: string; preco: number }[];
}) {
  const linha = { nome: dados.nome, horas: dados.horasPadrao, pecas: dados.pecas };
  const consulta = dados.id
    ? supabase().from("servicos_oficina").update(linha).eq("id", dados.id)
    : supabase().from("servicos_oficina").insert(linha);
  const { error } = await consulta;
  falhar(error);
}

export async function excluirServicoDaOficina(id: string) {
  const { error } = await supabase().from("servicos_oficina").delete().eq("id", id);
  falhar(error);
}

type LinhaOrcamento = {
  id: string;
  codigo: string;
  created_at: string;
  cliente: string;
  telefone_cliente: string;
  veiculo: Veiculo;
  modelo: string;
  itens: ItemOrcamento[];
  valor_hora: number | string;
  desconto_pct: number | string;
  total: number | string;
  status: StatusOrcamento;
  servicos_oficina: Servico[];
};

const paraOrcamento = (l: LinhaOrcamento): OrcamentoSalvo => ({
  id: l.id,
  codigo: l.codigo,
  criadoEm: l.created_at,
  cliente: l.cliente,
  telefoneCliente: l.telefone_cliente,
  veiculo: l.veiculo,
  modelo: l.modelo,
  itens: l.itens,
  valorHora: Number(l.valor_hora),
  descontoPct: Number(l.desconto_pct),
  total: Number(l.total),
  status: l.status,
  servicosDaOficina: l.servicos_oficina,
});

export async function listarOrcamentos(): Promise<OrcamentoSalvo[]> {
  const { data, error } = await supabase()
    .from("orcamentos")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<LinhaOrcamento[]>();
  falhar(error);
  return (data ?? []).map(paraOrcamento);
}

export async function buscarOrcamento(id: string): Promise<OrcamentoSalvo | null> {
  const { data, error } = await supabase()
    .from("orcamentos")
    .select("*")
    .eq("id", id)
    .maybeSingle<LinhaOrcamento>();
  // id inválido (não é uuid) conta como "não encontrado".
  if (error?.code === "22P02") return null;
  falhar(error);
  return data ? paraOrcamento(data) : null;
}

export async function salvarOrcamento(
  dados: Omit<OrcamentoSalvo, "id" | "codigo" | "criadoEm" | "status">,
): Promise<OrcamentoSalvo> {
  const { data, error } = await supabase()
    .from("orcamentos")
    .insert({
      cliente: dados.cliente,
      telefone_cliente: dados.telefoneCliente,
      veiculo: dados.veiculo,
      modelo: dados.modelo,
      itens: dados.itens,
      valor_hora: dados.valorHora,
      desconto_pct: dados.descontoPct,
      total: dados.total,
      servicos_oficina: dados.servicosDaOficina,
    })
    .select("*")
    .single<LinhaOrcamento>();
  // 42501 = a regra de RLS recusou: plano grátis sem orçamentos sobrando.
  if (error?.code === "42501") throw new LimiteGratisAtingido();
  falhar(error);
  return paraOrcamento(data!);
}

export async function atualizarStatus(id: string, status: StatusOrcamento) {
  const { error } = await supabase().from("orcamentos").update({ status }).eq("id", id);
  falhar(error);
}

export function linkWhatsApp(texto: string, telefone = "") {
  const numero = telefone.replace(/\D/g, "");
  const destino = numero ? (numero.startsWith("55") ? numero : `55${numero}`) : "";
  return `https://wa.me/${destino}?text=${encodeURIComponent(texto)}`;
}
