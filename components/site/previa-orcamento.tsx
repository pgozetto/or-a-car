import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import {
  VALOR_HORA_REFERENCIA,
  calcularOrcamento,
  descreverVeiculo,
  formatarReais,
} from "@/lib/orcamento";

// Orçamento de exemplo calculado pelo mesmo motor do painel,
// para a prévia mostrar exatamente o que a oficina vai enviar.
const veiculo = { tipoId: "hatch", marcaId: "chevrolet" };
const resultado = calcularOrcamento({
  itens: [{ servicoId: "troca-oleo" }, { servicoId: "pastilha-dianteira" }],
  valorHora: VALOR_HORA_REFERENCIA.padrao,
  veiculo,
});

export default function PreviaOrcamento() {
  return (
    <figure
      aria-label="Exemplo de orçamento"
      className="mx-auto w-full max-w-sm rounded-[2rem] border border-border bg-surface p-3 shadow-[0_30px_80px_-30px_rgb(56_189_248/0.35)]"
    >
      <div className="flex flex-col gap-5 rounded-[1.5rem] bg-background p-5">
        <div>
          <p className="text-sm text-muted">Auto Center Mineirão</p>
          <p className="text-xl font-semibold tracking-tight">Orçamento</p>
          <p className="text-sm text-muted">
            {descreverVeiculo(veiculo, "Onix 2020")}
          </p>
        </div>
        <ul className="flex flex-col gap-4">
          {resultado.linhas.map((l) => (
            <li key={l.servicoId} className="flex flex-col gap-1">
              <div className="flex justify-between gap-3 font-medium">
                <span>{l.nome}</span>
                <span className="tabular-nums">{formatarReais(l.total)}</span>
              </div>
              {l.pecas.map((p) => (
                <div key={p.nome} className="flex justify-between gap-3 text-sm text-muted">
                  <span>{p.nome}</span>
                  <span className="tabular-nums">{formatarReais(p.preco)}</span>
                </div>
              ))}
              <div className="flex justify-between gap-3 text-sm text-muted">
                <span>Mão de obra ({l.horas} h)</span>
                <span className="tabular-nums">{formatarReais(l.maoDeObra)}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-muted">Total</span>
          <span className="text-2xl font-semibold tabular-nums">
            {formatarReais(resultado.total)}
          </span>
        </div>
        <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-foreground">
          <WhatsappLogo size={20} weight="fill" />
          Enviar WhatsApp
        </div>
      </div>
    </figure>
  );
}
