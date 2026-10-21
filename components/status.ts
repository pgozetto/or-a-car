import type { StatusOrcamento } from "@/lib/armazenamento";

export const ROTULO_STATUS: Record<StatusOrcamento, { texto: string; cor: string }> = {
  enviado: { texto: "Enviado", cor: "text-muted" },
  aprovado: { texto: "Aprovado", cor: "text-accent" },
  recusado: { texto: "Recusado", cor: "text-danger" },
};
