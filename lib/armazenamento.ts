// Guarda os dados no próprio navegador enquanto não há banco de dados.
// Mantendo esta interface, a troca pelo Firestore fica isolada neste arquivo.
import type { ItemOrcamento, Veiculo } from "./orcamento";

export type Oficina = {
  nome: string;
  whatsapp: string;
  uf: string;
  local: "capital" | "interior";
  valorHora: number;
};

export type StatusOrcamento = "enviado" | "aprovado" | "recusado";

export type OrcamentoSalvo = {
  id: string;
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
};

const CHAVE_OFICINA = "orcacar:oficina";
const CHAVE_ORCAMENTOS = "orcacar:orcamentos";

function ler<T>(chave: string, padrao: T): T {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? (JSON.parse(valor) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {}
}

export const lerOficina = () => ler<Oficina | null>(CHAVE_OFICINA, null);
export const salvarOficina = (oficina: Oficina) =>
  gravar(CHAVE_OFICINA, oficina);

export const listarOrcamentos = () =>
  ler<OrcamentoSalvo[]>(CHAVE_ORCAMENTOS, []);

export const buscarOrcamento = (id: string) =>
  listarOrcamentos().find((o) => o.id === id) ?? null;

export function salvarOrcamento(
  dados: Omit<OrcamentoSalvo, "id" | "criadoEm" | "status">,
): OrcamentoSalvo {
  const orcamento: OrcamentoSalvo = {
    ...dados,
    id: crypto.randomUUID().slice(0, 8),
    criadoEm: new Date().toISOString(),
    status: "enviado",
  };
  gravar(CHAVE_ORCAMENTOS, [orcamento, ...listarOrcamentos()]);
  return orcamento;
}

export function atualizarStatus(id: string, status: StatusOrcamento) {
  gravar(
    CHAVE_ORCAMENTOS,
    listarOrcamentos().map((o) => (o.id === id ? { ...o, status } : o)),
  );
}

export function linkWhatsApp(texto: string, telefone = "") {
  const numero = telefone.replace(/\D/g, "");
  const destino = numero ? (numero.startsWith("55") ? numero : `55${numero}`) : "";
  return `https://wa.me/${destino}?text=${encodeURIComponent(texto)}`;
}
