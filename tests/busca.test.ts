import { describe, expect, test } from "vitest";
import { montarResultados, normalizarBusca, servicosDisponiveis, textoSelo } from "@/lib/busca";

describe("normalizarBusca", () => {
  test("tira espaços das pontas e espaços repetidos", () => {
    expect(normalizarBusca("  duna  ")).toBe("duna");
    expect(normalizarBusca("homem   de  ferro")).toBe("homem de ferro");
  });

  test("menos de 2 letras não vira busca", () => {
    expect(normalizarBusca("a")).toBeNull();
    expect(normalizarBusca("   ")).toBeNull();
    expect(normalizarBusca(undefined)).toBeNull();
  });

  test("dois textos no endereço não viram busca", () => {
    expect(normalizarBusca(["duna", "x"])).toBeNull();
  });

  test("corta em 100 caracteres", () => {
    expect(normalizarBusca("x".repeat(150))).toHaveLength(100);
  });

  test("mantém acentos e símbolos", () => {
    expect(normalizarBusca("ação & aventura")).toBe("ação & aventura");
  });
});

describe("servicosDisponiveis", () => {
  test("pega só os 5 serviços do site, na ordem dos botões", () => {
    expect(servicosDisponiveis([8, 1899, 300])?.map((s) => s.nome)).toEqual(["Netflix", "HBO Max"]);
  });

  test("nenhum dos 5 serviços = lista vazia (indisponível)", () => {
    expect(servicosDisponiveis([300])).toEqual([]);
  });

  test("sem informação = null", () => {
    expect(servicosDisponiveis(null)).toBeNull();
  });
});

describe("textoSelo", () => {
  test("lista os serviços com ✓", () => {
    expect(textoSelo(servicosDisponiveis([119, 1899]))).toBe("✓ Prime Video, HBO Max");
  });

  test("mostra até 3 nomes e o resto como +N", () => {
    expect(textoSelo(servicosDisponiveis([8, 119, 337, 1899, 307]))).toBe("✓ Netflix, Prime Video, Disney+ +2");
  });

  test("lista vazia = Indisponível; sem informação = sem selo", () => {
    expect(textoSelo([])).toBe("Indisponível");
    expect(textoSelo(null)).toBeNull();
  });
});

describe("montarResultados", () => {
  const f = (id: number) => ({ id, titulo: `F${id}`, ano: "", nota: 0, capa: null });

  test("disponíveis primeiro, mantendo a relevância dentro de cada grupo", () => {
    const r = montarResultados([f(1), f(2), f(3), f(4)], [[300], null, [8], [119]], 25);
    expect(r.filmes.map((x) => x.id)).toEqual([3, 4, 1, 2]);
  });

  test("um filme cuja consulta falhou fica sem informação (sem selo)", () => {
    const r = montarResultados([f(1), f(2), f(3), f(4)], [[300], null, [8], [119]], 25);
    expect(r.filmes.find((x) => x.id === 2)?.servicos).toBeNull();
    expect(r.filmes.find((x) => x.id === 1)?.servicos).toEqual([]);
  });

  test("avisa quando o TMDB tinha mais de 20 resultados", () => {
    expect(montarResultados([f(1)], [[8]], 25).temMais).toBe(true);
    expect(montarResultados([f(1)], [[8]], 20).temMais).toBe(false);
  });
});
