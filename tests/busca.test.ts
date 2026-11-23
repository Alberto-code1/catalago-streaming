import { describe, expect, test } from "vitest";
import { normalizarBusca } from "@/lib/busca";

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
