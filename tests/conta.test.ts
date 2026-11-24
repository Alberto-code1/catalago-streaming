import { describe, expect, it, vi } from "vitest";
import { comPadraoSeFalhar, lerVolta, loginDeTesteLigado, origensConfiaveis, proxyOAuthLigado } from "@/lib/conta";

describe("lerVolta", () => {
  it("aceita caminhos do próprio site", () => {
    expect(lerVolta("/filme/27205")).toBe("/filme/27205");
    expect(lerVolta("/busca?q=duna")).toBe("/busca?q=duna");
  });

  it("recusa endereços de outros sites e valores estranhos", () => {
    for (const valor of [
      "//mal.com",
      "https://mal.com",
      "/\\mal.com",
      // O navegador apaga tab e quebra de linha: "/\t/mal.com" vira "//mal.com"
      "/\t/mal.com",
      "/\n/mal.com",
      "/\r//mal.com",
      "",
      undefined,
      ["/a", "/b"],
      "filme/1",
    ]) {
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

describe("proxyOAuthLigado", () => {
  it("liga na Vercel (prévias e site oficial), nunca no computador", () => {
    expect(proxyOAuthLigado({ VERCEL: "1", VERCEL_ENV: "preview" })).toBe(true);
    expect(proxyOAuthLigado({ VERCEL: "1", VERCEL_ENV: "production" })).toBe(true);
    expect(proxyOAuthLigado({})).toBe(false);
  });
});

describe("origensConfiaveis", () => {
  it("inclui o site oficial, a prévia atual e o endereço do ramo", () => {
    expect(
      origensConfiaveis({ VERCEL_URL: "x-abc.vercel.app", VERCEL_BRANCH_URL: "x-git-ramo.vercel.app" }),
    ).toEqual(["https://catalogo-streaming-one.vercel.app", "https://x-abc.vercel.app", "https://x-git-ramo.vercel.app"]);
  });

  it("no computador, inclui o BETTER_AUTH_URL", () => {
    expect(origensConfiaveis({ BETTER_AUTH_URL: "http://localhost:3000" })).toEqual([
      "https://catalogo-streaming-one.vercel.app",
      "http://localhost:3000",
    ]);
  });
});
