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
