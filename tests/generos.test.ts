import { describe, expect, test } from "vitest";
import { lerGenero, lerIdGenero } from "@/lib/generos";

const generos = [
  { id: 28, nome: "Ação" },
  { id: 35, nome: "Comédia" },
];

describe("lerGenero", () => {
  test("acha o gênero pelo id que veio no endereço", () => {
    expect(lerGenero("35", generos)).toEqual({ id: 35, nome: "Comédia" });
  });

  test("id fora da lista, texto inválido ou vazio vira 'Todos'", () => {
    expect(lerGenero("999", generos)).toBeUndefined();
    expect(lerGenero("abc", generos)).toBeUndefined();
    expect(lerGenero(undefined, generos)).toBeUndefined();
  });

  test("dois gêneros no endereço vira 'Todos'", () => {
    expect(lerGenero(["35", "28"], generos)).toBeUndefined();
  });

  test("se a lista de gêneros falhou, ignora o gênero", () => {
    expect(lerGenero("35", null)).toBeUndefined();
  });
});

describe("lerIdGenero", () => {
  test("aceita só um número inteiro positivo", () => {
    expect(lerIdGenero("35")).toBe(35);
    expect(lerIdGenero("0")).toBeUndefined();
    expect(lerIdGenero("-3")).toBeUndefined();
    expect(lerIdGenero("3.5")).toBeUndefined();
    expect(lerIdGenero("abc")).toBeUndefined();
    expect(lerIdGenero(["35"])).toBeUndefined();
  });
});
