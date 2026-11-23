import { describe, expect, it, vi } from "vitest";
import { comPadraoSeFalhar, lerVolta, loginDeTesteLigado } from "@/lib/conta";

describe("lerVolta", () => {
  it("aceita caminhos do próprio site", () => {
    expect(lerVolta("/filme/27205")).toBe("/filme/27205");
    expect(lerVolta("/busca?q=duna")).toBe("/busca?q=duna");
  });

  it("recusa endereços de outros sites e valores estranhos", () => {
    for (const valor of ["//mal.com", "https://mal.com", "/\\mal.com", "", undefined, ["/a", "/b"], "filme/1"]) {
      expect(lerVolta(valor)).toBe("/");
    }
  });
});

describe("comPadraoSeFalhar", () => {
  it("devolve o padrão quando a função falha", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await comPadraoSeFalhar(() => Promise.reject(new Error("banco fora")), null)).toBeNull();
    expect(erro).toHaveBeenCalled();
    erro.mockRestore();
  });

  it("devolve o valor quando a função funciona", async () => {
    expect(await comPadraoSeFalhar(() => Promise.resolve(42), 0)).toBe(42);
  });
});

describe("loginDeTesteLigado", () => {
  it("liga só com LOGIN_DE_TESTE=1 e fora da Vercel", () => {
    expect(loginDeTesteLigado({ LOGIN_DE_TESTE: "1" })).toBe(true);
    expect(loginDeTesteLigado({ LOGIN_DE_TESTE: "1", VERCEL: "1" })).toBe(false);
    expect(loginDeTesteLigado({})).toBe(false);
  });
});
