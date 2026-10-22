"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import {
  CATEGORIAS,
  MARCAS,
  SERVICOS,
  TIPOS_VEICULO,
  calcularOrcamento,
  descreverVeiculo,
  formatarReais,
  textoWhatsApp,
  type ItemOrcamento,
  type Servico,
} from "@/lib/orcamento";
import {
  LimiteGratisAtingido,
  linkWhatsApp,
  listarServicosDaOficina,
  salvarOrcamento,
  type OficinaCompleta,
} from "@/lib/armazenamento";
import { LIMITE_GRATIS, temAssinaturaAtiva } from "@/lib/planos";
import { Campo, Etapa, Selecao, estiloBotaoPrincipal } from "./campos";
import CampoValor from "./campo-valor";

type Ajuste = Omit<ItemOrcamento, "servicoId">;

export default function NovoOrcamento({ oficina }: { oficina: OficinaCompleta }) {
  const router = useRouter();
  const [tipoId, setTipoId] = useState("hatch");
  const [marcaId, setMarcaId] = useState("");
  const [modelo, setModelo] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [ajustes, setAjustes] = useState<Record<string, Ajuste>>({});
  const [descontoPct, setDescontoPct] = useState(0);
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [servicosDaOficina, setServicosDaOficina] = useState<Servico[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<"limite" | "falha" | null>(null);

  useEffect(() => {
    listarServicosDaOficina()
      .then(setServicosDaOficina)
      .catch(() => setServicosDaOficina([]));
  }, []);

  const gratis = !temAssinaturaAtiva(oficina.assinatura);
  const gratisRestantes = Math.max(LIMITE_GRATIS - oficina.assinatura.orcamentosCriados, 0);

  const todosServicos = useMemo(
    () => [...servicosDaOficina, ...SERVICOS],
    [servicosDaOficina],
  );
  // Serviços da oficina primeiro, depois a tabela base na ordem das categorias.
  const grupos = Object.keys(CATEGORIAS)
    .sort((a, b) => (a === "oficina" ? -1 : b === "oficina" ? 1 : 0))
    .map((categoria) => ({
      categoria,
      servicos: todosServicos.filter((s) => s.categoria === categoria),
    }))
    .filter((g) => g.servicos.length > 0);

  const veiculo = { tipoId, marcaId };
  const itens = selecionados.map((servicoId) => ({
    servicoId,
    ...ajustes[servicoId],
  }));

  const resultado = useMemo(
    () =>
      calcularOrcamento(
        {
          itens,
          valorHora: oficina.valorHora,
          veiculo,
          descontoPct,
        },
        todosServicos,
      ),
    // itens e veiculo são derivados destes estados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selecionados, ajustes, tipoId, marcaId, descontoPct, oficina.valorHora, todosServicos],
  );

  // Mudou o carro, os valores sugeridos mudam: descarta ajustes antigos.
  function trocarVeiculo(tipo: string, marca: string) {
    setTipoId(tipo);
    setMarcaId(marca);
    setAjustes({});
  }

  function alternar(id: string) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((s) => s !== id) : [...atual, id],
    );
  }

  function ajustar(servicoId: string, mudanca: (a: Ajuste) => Ajuste) {
    setAjustes((atual) => ({
      ...atual,
      [servicoId]: mudanca(atual[servicoId] ?? {}),
    }));
  }

  const semOrcamentosGratis = gratis && gratisRestantes === 0;
  const podeEnviar =
    marcaId !== "" && resultado.linhas.length > 0 && !salvando && !semOrcamentosGratis;

  async function salvarEEnviar() {
    // Abre a aba já no toque: depois do await o navegador bloquearia o popup.
    const janela = window.open("", "_blank");
    setSalvando(true);
    setErro(null);
    try {
      const salvo = await salvarOrcamento({
        cliente,
        telefoneCliente: telefone,
        veiculo,
        modelo,
        itens,
        valorHora: oficina.valorHora,
        descontoPct,
        total: resultado.total,
        servicosDaOficina: servicosDaOficina.filter((s) =>
          selecionados.includes(s.id),
        ),
      });
      const texto = textoWhatsApp(
        oficina.nome,
        resultado,
        descreverVeiculo(veiculo, modelo),
      );
      if (janela) {
        janela.opener = null;
        janela.location.href = linkWhatsApp(texto, telefone);
      }
      router.push(`/painel/orcamentos/${salvo.id}`);
    } catch (e) {
      janela?.close();
      setErro(e instanceof LimiteGratisAtingido ? "limite" : "falha");
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-10 pb-36">
      {gratis && (
        <div
          className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
            semOrcamentosGratis ? "border-accent bg-accent/10" : "border-border bg-surface"
          }`}
        >
          <p>
            {semOrcamentosGratis
              ? "Seus 3 orçamentos grátis acabaram. Assine para continuar fazendo orçamentos."
              : `Plano grátis: ${gratisRestantes} de ${LIMITE_GRATIS} orçamentos restantes.`}
          </p>
          <Link
            href="/painel/conta"
            className={semOrcamentosGratis ? estiloBotaoPrincipal : "font-semibold text-accent"}
          >
            {semOrcamentosGratis ? "Ver planos" : "Assinar"}
          </Link>
        </div>
      )}

      <Etapa numero={1} titulo="Qual é o carro?">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo do carro">
          {TIPOS_VEICULO.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tipoId === t.id}
              onClick={() => trocarVeiculo(t.id, marcaId)}
              className={`h-12 rounded-full border px-4 text-sm font-medium transition-colors ${
                tipoId === t.id
                  ? "border-accent bg-accent text-accent-foreground sombra-botao"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {t.nome}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Selecao
            rotulo="Marca"
            value={marcaId}
            onChange={(e) => trocarVeiculo(tipoId, e.target.value)}
          >
            <option value="" disabled>
              Escolha a marca
            </option>
            {MARCAS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </Selecao>
          <Campo
            rotulo="Modelo e ano (opcional)"
            placeholder="Ex.: Onix 2020"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />
        </div>
      </Etapa>

      <Etapa numero={2} titulo="Quais serviços?">
        {grupos.map((g) => (
          <div key={g.categoria} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-muted">
              {CATEGORIAS[g.categoria]}
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {g.servicos.map((s) => {
                const ativo = selecionados.includes(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => alternar(s.id)}
                      className={`flex min-h-16 w-full items-center rounded-2xl border px-4 py-3 text-left font-medium sombra-botao-leve transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
                        ativo
                          ? "border-accent bg-accent/15 ring-1 ring-accent"
                          : "border-border bg-surface hover:bg-surface-2"
                      }`}
                    >
                      {s.nome}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <Link
          href="/painel/oficina#servicos"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-border font-medium text-accent transition-colors hover:bg-surface-2"
        >
          <Plus size={20} weight="bold" />
          Adicionar um serviço da sua oficina
        </Link>
      </Etapa>

      {resultado.linhas.length > 0 && (
        <Etapa numero={3} titulo="Peças e mão de obra">
          <p className="-mt-1 text-sm text-muted">
            Valores sugeridos para este carro. Toque para mudar.
          </p>
          <ul className="flex flex-col gap-3">
            {resultado.linhas.map((l) => (
              <li
                key={l.servicoId}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{l.nome}</span>
                  <span className="tabular-nums text-muted">
                    {formatarReais(l.total)}
                  </span>
                </div>
                {l.pecas.map((p) => (
                  <CampoValor
                    key={`${p.nome}-${tipoId}-${marcaId}`}
                    rotulo={p.nome}
                    prefixo="R$"
                    valor={p.preco}
                    onChange={(preco) =>
                      ajustar(l.servicoId, (a) => ({
                        ...a,
                        precosPecas: { ...a.precosPecas, [p.nome]: preco },
                      }))
                    }
                  />
                ))}
                <CampoValor
                  key={`horas-${tipoId}-${marcaId}`}
                  rotulo={`Mão de obra (${formatarReais(l.maoDeObra)})`}
                  sufixo="horas"
                  valor={l.horas}
                  onChange={(horas) => ajustar(l.servicoId, (a) => ({ ...a, horas }))}
                />
              </li>
            ))}
          </ul>
        </Etapa>
      )}

      <Etapa numero={resultado.linhas.length > 0 ? 4 : 3} titulo="Para quem é?">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo
            rotulo="Nome do cliente (opcional)"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
          <Campo
            rotulo="WhatsApp do cliente (opcional)"
            type="tel"
            inputMode="tel"
            placeholder="(11) 91234-5678"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          <CampoValor
            rotulo="Desconto"
            sufixo="%"
            valor={descontoPct}
            onChange={setDescontoPct}
          />
        </div>
      </Etapa>

      {erro && (
        <p role="alert" className="rounded-xl bg-danger/10 p-3 text-danger">
          {erro === "limite" ? (
            <>
              Seus orçamentos grátis acabaram.{" "}
              <Link href="/painel/conta" className="font-semibold underline">
                Assine um plano
              </Link>{" "}
              para continuar.
            </>
          ) : (
            "Não foi possível salvar o orçamento. Confira a internet e tente de novo."
          )}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm text-muted">
              {marcaId ? "Total" : "Escolha a marca do carro"}
            </p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatarReais(resultado.total)}
            </p>
          </div>
          <button
            type="button"
            disabled={!podeEnviar}
            onClick={salvarEEnviar}
            className={estiloBotaoPrincipal}
          >
            {salvando ? "Salvando..." : "Enviar WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
