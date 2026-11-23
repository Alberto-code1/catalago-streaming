import { describe, expect, it } from "vitest";
import { LIMITES, lerAba, lerIdFilme, lerNota } from "@/lib/listas";

describe("lerIdFilme", () => {
  it("aceita ids de filme válidos (número ou texto)", () => {
    expect(lerIdFilme(27205)).toBe(27205);
    expect(lerIdFilme("27205")).toBe(27205);
  });

  it("recusa qualquer outra coisa", () => {
    for (const valor of ["abc", 0, -3, 1.5, "12abc", 2147483648, null, undefined, "", [1]]) {
      expect(lerIdFilme(valor)).toBeNull();
    }
  });
});

describe("lerAba", () => {
  it("aceita as três abas e usa 'quero' no resto", () => {
    expect(lerAba("assistidos")).toBe("assistidos");
    expect(lerAba("recentes")).toBe("recentes");
    expect(lerAba("xyz")).toBe("quero");
    expect(lerAba(undefined)).toBe("quero");
  });
});

describe("LIMITES", () => {
  it("são os combinados no design", () => {
    expect(LIMITES).toEqual({ quero: 500, assistidos: 2000, vistos: 20, buscas: 5, porPagina: 24 });
  });
});

describe("lerNota", () => {
  it("aceita gostei, nao_gostei e nenhuma (null)", () => {
    expect(lerNota("gostei")).toBe("gostei");
    expect(lerNota("nao_gostei")).toBe("nao_gostei");
    expect(lerNota(null)).toBeNull();
  });

  it("recusa qualquer outra coisa (undefined)", () => {
    for (const valor of ["amei", 1, undefined, "GOSTEI"]) {
      expect(lerNota(valor)).toBeUndefined();
    }
  });
});
