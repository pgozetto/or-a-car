"use client";

import { useState, type FormEvent } from "react";
import { VALOR_HORA_REFERENCIA, fatorRegional } from "@/lib/orcamento";
import { salvarOficina, type Oficina } from "@/lib/armazenamento";
import { Campo, Selecao, estiloBotaoPrincipal } from "./campos";
import CampoValor from "./campo-valor";

const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

function valorHoraSugerido(uf: string, local: Oficina["local"]) {
  return Math.round(VALOR_HORA_REFERENCIA.padrao * fatorRegional(uf, local));
}

export default function FormOficina({
  inicial,
  aoSalvar,
  textoBotao,
}: {
  inicial?: Oficina | null;
  aoSalvar: (oficina: Oficina) => void;
  textoBotao: string;
}) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [whatsapp, setWhatsapp] = useState(inicial?.whatsapp ?? "");
  const [uf, setUf] = useState(inicial?.uf ?? "SP");
  const [local, setLocal] = useState<Oficina["local"]>(inicial?.local ?? "capital");
  const [valorHora, setValorHora] = useState(
    inicial?.valorHora ?? valorHoraSugerido("SP", "capital"),
  );
  // Enquanto o usuário não mexe no valor da hora, ele acompanha a região.
  const [horaEditada, setHoraEditada] = useState(Boolean(inicial));

  function trocarRegiao(novaUf: string, novoLocal: Oficina["local"]) {
    setUf(novaUf);
    setLocal(novoLocal);
    if (!horaEditada) setValorHora(valorHoraSugerido(novaUf, novoLocal));
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const oficina = { nome: nome.trim(), whatsapp, uf, local, valorHora };
    salvarOficina(oficina);
    aoSalvar(oficina);
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <Campo
        rotulo="Nome da oficina"
        required
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex.: Auto Center do Zé"
      />
      <Campo
        rotulo="WhatsApp da oficina"
        type="tel"
        inputMode="tel"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        placeholder="(11) 91234-5678"
      />
      <div className="grid grid-cols-2 gap-3">
        <Selecao rotulo="Estado" value={uf} onChange={(e) => trocarRegiao(e.target.value, local)}>
          {UFS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </Selecao>
        <Selecao
          rotulo="Cidade"
          value={local}
          onChange={(e) => trocarRegiao(uf, e.target.value as Oficina["local"])}
        >
          <option value="capital">Capital</option>
          <option value="interior">Interior</option>
        </Selecao>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <CampoValor
          key={horaEditada ? "editado" : `${uf}-${local}`}
          rotulo="Quanto você cobra por hora?"
          prefixo="R$"
          valor={valorHora}
          onChange={(v) => {
            setHoraEditada(true);
            setValorHora(v);
          }}
        />
        <p className="mt-2 text-sm text-muted">
          Sugestão para a sua região. Pode mudar quando quiser.
        </p>
      </div>
      <button type="submit" disabled={!nome.trim()} className={estiloBotaoPrincipal}>
        {textoBotao}
      </button>
    </form>
  );
}
