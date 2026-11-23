import { describe, expect, test } from "vitest";
import { juntarSemRepetir, lerPagina, montarParametrosDiscover } from "@/lib/discover";
import { idsDeTodos } from "@/lib/servicos";

const base = {
  watch_region: "BR",
  with_watch_monetization_types: "flatrate|free|ads",
  sort_by: "popularity.desc",
  language: "pt-BR",
};

describe("montarParametrosDiscover", () => {
  test("filtra por um serviço quando ele é escolhido", () => {
    expect(montarParametrosDiscover("netflix", 1)).toEqual({ ...base, page: "1", with_watch_providers: "8" });
  });

  test("em 'Todos', usa os 5 serviços juntos", () => {
    expect(montarParametrosDiscover(undefined, 2)).toEqual({ ...base, page: "2", with_watch_providers: idsDeTodos() });
  });

  test("serviço desconhecido na URL vira 'Todos'", () => {
    expect(montarParametrosDiscover("xpto", 1).with_watch_providers).toBe(idsDeTodos());
  });
});

describe("lerPagina", () => {
  test("lê um número de página válido", () => {
    expect(lerPagina("3")).toBe(3);
    expect(lerPagina("2.7")).toBe(2);
  });

  test("valores inválidos viram a página 1", () => {
    expect(lerPagina(null)).toBe(1);
    expect(lerPagina("abc")).toBe(1);
    expect(lerPagina("0")).toBe(1);
    expect(lerPagina("-5")).toBe(1);
  });

  test("nunca passa da página 500 (limite do TMDB)", () => {
    expect(lerPagina("9999")).toBe(500);
  });
});

describe("juntarSemRepetir", () => {
  const a = { id: 1, titulo: "A", ano: "2020", nota: 7, capa: null };
  const b = { id: 2, titulo: "B", ano: "2021", nota: 6, capa: null };

  test("acrescenta só os filmes que ainda não estão na lista", () => {
    expect(juntarSemRepetir([a], [a, b])).toEqual([a, b]);
  });

  test("não repete um filme que vem duas vezes na mesma página", () => {
    expect(juntarSemRepetir([], [b, b])).toEqual([b]);
  });
});
