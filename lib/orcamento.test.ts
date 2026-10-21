import { describe, expect, it } from "vitest";
import {
  SERVICOS,
  calcularOrcamento,
  fatorRegional,
  horasSugeridas,
  precoSugeridoPeca,
  textoWhatsApp,
  type Servico,
} from "./orcamento";

const servicos: Servico[] = [
  {
    id: "oleo",
    nome: "Troca de óleo",
    categoria: "revisao",
    horasPadrao: 0.5,
    pecas: [
      { nome: "Óleo", precoPadrao: 100, precoMin: 80, precoMax: 150 },
      { nome: "Filtro", precoPadrao: 30.1, precoMin: 20, precoMax: 50 },
    ],
  },
  {
    id: "scanner",
    nome: "Scanner",
    categoria: "eletrica",
    horasPadrao: 1,
    pecas: [],
  },
];

describe("calcularOrcamento", () => {
  it("soma mão de obra e peças", () => {
    const r = calcularOrcamento(
      { itens: [{ servicoId: "oleo" }, { servicoId: "scanner" }], valorHora: 80 },
      servicos,
    );
    expect(r.totalMaoDeObra).toBe(120);
    expect(r.totalPecas).toBe(130.1);
    expect(r.total).toBe(250.1);
  });

  it("aplica o fator regional só na mão de obra", () => {
    const r = calcularOrcamento(
      { itens: [{ servicoId: "oleo" }], valorHora: 80, fatorRegional: 1.25 },
      servicos,
    );
    expect(r.totalMaoDeObra).toBe(50);
    expect(r.totalPecas).toBe(130.1);
  });

  it("respeita ajustes de horas e preço de peça", () => {
    const r = calcularOrcamento(
      {
        itens: [{ servicoId: "oleo", horas: 1, precosPecas: { Óleo: 200 } }],
        valorHora: 100,
      },
      servicos,
    );
    expect(r.total).toBe(330.1);
  });

  it("aplica desconto arredondado ao centavo e limita a 100%", () => {
    const r = calcularOrcamento(
      { itens: [{ servicoId: "oleo" }], valorHora: 80, descontoPct: 10 },
      servicos,
    );
    expect(r.subtotal).toBe(170.1);
    expect(r.desconto).toBe(17.01);
    expect(r.total).toBe(153.09);

    const tudo = calcularOrcamento(
      { itens: [{ servicoId: "oleo" }], valorHora: 80, descontoPct: 150 },
      servicos,
    );
    expect(tudo.total).toBe(0);
  });

  it("rejeita serviço desconhecido", () => {
    expect(() =>
      calcularOrcamento({ itens: [{ servicoId: "xyz" }], valorHora: 80 }, servicos),
    ).toThrow("Serviço desconhecido");
  });
});

describe("veículo", () => {
  const servico = (id: string) => SERVICOS.find((s) => s.id === id)!;

  it("usa horas específicas do tipo quando existem", () => {
    expect(
      horasSugeridas(servico("embreagem"), { tipoId: "picape", marcaId: "toyota" }),
    ).toBe(8);
  });

  it("multiplica horas por tipo e marca e arredonda ao quarto de hora", () => {
    // 0,75 h × 1,1 (sedã) × 1,4 (BMW) = 1,155 h → 1,25 h
    expect(
      horasSugeridas(servico("troca-oleo"), { tipoId: "sedan", marcaId: "bmw" }),
    ).toBe(1.25);
  });

  it("ajusta o preço da peça por tipo e marca", () => {
    const pastilha = servico("pastilha-dianteira").pecas[0];
    // 180 × 1,3 (SUV) × 1,25 (Jeep) = 292,50
    expect(precoSugeridoPeca(pastilha, { tipoId: "suv", marcaId: "jeep" })).toBe(292.5);
  });

  it("sem veículo usa a tabela base", () => {
    const r = calcularOrcamento({ itens: [{ servicoId: "troca-oleo" }], valorHora: 80 });
    expect(r.total).toBe(255);
  });

  it("preço editado da peça vence o sugerido", () => {
    const r = calcularOrcamento({
      itens: [{ servicoId: "pastilha-dianteira", precosPecas: { "Jogo de pastilhas dianteiras": 150 } }],
      valorHora: 80,
      veiculo: { tipoId: "suv", marcaId: "bmw" },
    });
    expect(r.linhas[0].pecas[0].preco).toBe(150);
  });
});

describe("fatorRegional", () => {
  it("usa a UF quando existe e o padrão quando não", () => {
    expect(fatorRegional("sp", "capital")).toBe(1.25);
    expect(fatorRegional("AC", "interior")).toBe(0.9);
  });
});

describe("textoWhatsApp", () => {
  it("lista serviços e total", () => {
    const r = calcularOrcamento(
      { itens: [{ servicoId: "scanner" }], valorHora: 80 },
      servicos,
    );
    const texto = textoWhatsApp("Oficina do Zé", r);
    expect(texto).toContain("Oficina do Zé");
    expect(texto).toContain("Scanner");
    expect(texto).not.toContain("Desconto");
  });
});
