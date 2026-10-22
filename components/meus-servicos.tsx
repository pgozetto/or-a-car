"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash, PencilSimple } from "@phosphor-icons/react";
import {
  excluirServicoDaOficina,
  listarServicosDaOficina,
  salvarServicoDaOficina,
} from "@/lib/armazenamento";
import { formatarReais, type Servico } from "@/lib/orcamento";
import { Campo, estiloBotaoPrincipal, estiloBotaoSecundario } from "./campos";
import CampoValor from "./campo-valor";

type PecaForm = { chave: number; nome: string; preco: number };

const estiloInput =
  "h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base text-foreground outline-none transition-colors focus:border-accent";

let proximaChave = 0;
const novaPeca = (nome = "", preco = 0): PecaForm => ({
  chave: proximaChave++,
  nome,
  preco,
});

export default function MeusServicos({ valorHora }: { valorHora: number }) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [horas, setHoras] = useState(1);
  const [pecas, setPecas] = useState<PecaForm[]>([]);
  // Muda a cada edição para os campos de valor recarregarem o texto.
  const [versaoForm, setVersaoForm] = useState(0);
  const [aviso, setAviso] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function recarregar() {
    try {
      setServicos(await listarServicosDaOficina());
    } catch {
      setErro("Não foi possível carregar seus serviços.");
    }
  }

  useEffect(() => {
    recarregar();
  }, []);

  function limpar() {
    setEditandoId(null);
    setNome("");
    setHoras(1);
    setPecas([]);
    setVersaoForm((v) => v + 1);
  }

  function editar(s: Servico) {
    setEditandoId(s.id);
    setNome(s.nome);
    setHoras(s.horasPadrao);
    setPecas(s.pecas.map((p) => novaPeca(p.nome, p.precoPadrao)));
    setVersaoForm((v) => v + 1);
    setAviso("");
    document.getElementById("form-servico")?.scrollIntoView({ behavior: "smooth" });
  }

  async function excluir(s: Servico) {
    if (!window.confirm(`Excluir o serviço "${s.nome}"?`)) return;
    try {
      await excluirServicoDaOficina(s.id);
      if (editandoId === s.id) limpar();
      await recarregar();
    } catch {
      setErro("Não foi possível excluir. Tente de novo.");
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      await salvarServicoDaOficina({
        id: editandoId ?? undefined,
        nome: nome.trim(),
        horasPadrao: horas,
        pecas: pecas
          .filter((p) => p.nome.trim())
          .map((p) => ({ nome: p.nome.trim(), preco: p.preco })),
      });
      setAviso(editandoId ? "Serviço atualizado." : "Serviço adicionado.");
      limpar();
      await recarregar();
    } catch {
      setErro("Não foi possível salvar o serviço. Tente de novo.");
    }
    setSalvando(false);
  }

  const totalForm = horas * valorHora + pecas.reduce((s, p) => s + p.preco, 0);

  return (
    <section id="servicos" className="flex scroll-mt-6 flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Meus serviços</h2>
        <p className="mt-1 text-muted">
          Crie os serviços que só a sua oficina faz, com o tempo e o preço que
          você cobra. Eles aparecem no Novo orçamento com esses valores fixos.
        </p>
      </div>

      {servicos.length > 0 && (
        <ul className="flex flex-col gap-3">
          {servicos.map((s) => {
            const pecasTotal = s.pecas.reduce((t, p) => t + p.precoPadrao, 0);
            return (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{s.nome}</p>
                  <p className="text-sm text-muted">
                    {s.horasPadrao} h + {formatarReais(pecasTotal)} em peças ={" "}
                    <span className="font-semibold text-foreground">
                      {formatarReais(s.horasPadrao * valorHora + pecasTotal)}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => editar(s)}
                    aria-label={`Editar ${s.nome}`}
                    className="flex size-12 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <PencilSimple size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() => excluir(s)}
                    aria-label={`Excluir ${s.nome}`}
                    className="flex size-12 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                  >
                    <Trash size={22} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form
        id="form-servico"
        onSubmit={salvar}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4"
      >
        <h3 className="text-lg font-semibold">
          {editandoId ? "Editar serviço" : "Adicionar novo serviço"}
        </h3>
        <Campo
          rotulo="Nome do serviço"
          required
          placeholder="Ex.: Polimento de farol"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <CampoValor
          key={`horas-${versaoForm}`}
          rotulo={`Tempo de serviço (${formatarReais(horas * valorHora)})`}
          sufixo="horas"
          valor={horas}
          onChange={setHoras}
        />

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">Peças (opcional)</p>
          {pecas.map((p, i) => (
            <div
              key={p.chave}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background p-2 sm:flex-nowrap sm:border-0 sm:bg-transparent sm:p-0"
            >
              <input
                aria-label={`Nome da peça ${i + 1}`}
                placeholder="Nome da peça"
                value={p.nome}
                onChange={(e) =>
                  setPecas((atual) =>
                    atual.map((x) => (x.chave === p.chave ? { ...x, nome: e.target.value } : x)),
                  )
                }
                className={`${estiloInput} basis-full sm:basis-auto`}
              />
              <div className="shrink-0">
                <CampoValor
                  key={`preco-${p.chave}-${versaoForm}`}
                  rotulo=""
                  prefixo="R$"
                  valor={p.preco}
                  onChange={(preco) =>
                    setPecas((atual) =>
                      atual.map((x) => (x.chave === p.chave ? { ...x, preco } : x)),
                    )
                  }
                />
              </div>
              <button
                type="button"
                aria-label={`Remover peça ${i + 1}`}
                onClick={() => setPecas((atual) => atual.filter((x) => x.chave !== p.chave))}
                className="ml-auto flex size-12 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:text-danger sm:ml-0"
              >
                <Trash size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPecas((atual) => [...atual, novaPeca()])}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-border font-medium text-accent transition-colors hover:bg-surface-2"
          >
            <Plus size={20} weight="bold" />
            Adicionar peça
          </button>
        </div>

        <p className="text-muted">
          Preço deste serviço:{" "}
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {formatarReais(totalForm)}
          </span>
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={!nome.trim() || salvando}
            className={estiloBotaoPrincipal}
          >
            {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Adicionar serviço"}
          </button>
          {editandoId && (
            <button type="button" onClick={limpar} className={estiloBotaoSecundario}>
              Cancelar
            </button>
          )}
        </div>
        {aviso && (
          <p role="status" className="text-center text-accent">
            {aviso}
          </p>
        )}
        {erro && (
          <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {erro}
          </p>
        )}
      </form>
    </section>
  );
}
