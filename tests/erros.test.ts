import { describe, expect, test } from "vitest";
import { TmdbErro, ehErroTmdb } from "@/lib/erros";

describe("ehErroTmdb", () => {
  test("reconhece um erro do TMDB", () => {
    expect(ehErroTmdb(new TmdbErro("falhou", 401))).toBe(true);
  });

  test("reconhece o erro mesmo depois de passar pelo cache (que recria o objeto)", () => {
    const recriado = Object.assign(new Error("TMDB respondeu 401"), { name: "TmdbErro" });
    expect(ehErroTmdb(recriado)).toBe(true);
  });

  test("não confunde com outros erros", () => {
    expect(ehErroTmdb(new Error("outra coisa"))).toBe(false);
    expect(ehErroTmdb("texto")).toBe(false);
  });
});
