import { describe, expect, test } from "vitest";
import { hrefCatalogo, hrefFilme } from "@/lib/links";

describe("hrefFilme", () => {
  test("leva o filtro junto para a página do filme", () => {
    expect(hrefFilme(27205, "netflix")).toBe("/filme/27205?servico=netflix");
  });

  test("sem filtro, é só o endereço do filme", () => {
    expect(hrefFilme(27205, undefined)).toBe("/filme/27205");
  });
});

describe("hrefCatalogo", () => {
  test("volta ao catálogo com o filtro", () => {
    expect(hrefCatalogo("netflix")).toBe("/?servico=netflix");
  });

  test("filtro desconhecido ou vazio volta para 'Todos'", () => {
    expect(hrefCatalogo("xpto")).toBe("/");
    expect(hrefCatalogo(undefined)).toBe("/");
  });
});

describe("links com gênero", () => {
  test("o catálogo leva serviço e gênero, nessa ordem", () => {
    expect(hrefCatalogo("netflix", 35)).toBe("/?servico=netflix&genero=35");
    expect(hrefCatalogo(undefined, 35)).toBe("/?genero=35");
  });

  test("serviço inválido sai do link, o gênero fica", () => {
    expect(hrefCatalogo("xpto", 35)).toBe("/?genero=35");
  });

  test("a página do filme também leva os dois", () => {
    expect(hrefFilme(27205, "netflix", 35)).toBe("/filme/27205?servico=netflix&genero=35");
    expect(hrefFilme(27205, undefined, 35)).toBe("/filme/27205?genero=35");
  });
});
