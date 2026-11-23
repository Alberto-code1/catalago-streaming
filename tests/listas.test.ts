import { describe, expect, it } from "vitest";
import { chaveBusca, LIMITES, lerAba, lerIdFilme, lerNota, montarExportacao } from "@/lib/listas";

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

describe("chaveBusca", () => {
  it("limpa espaços e ignora maiúsculas, para a mesma busca não repetir", () => {
    expect(chaveBusca("  Duna   Parte 2 ")).toBe("duna parte 2");
    expect(chaveBusca("DUNA")).toBe(chaveBusca("duna"));
  });
});

describe("montarExportacao", () => {
  it("junta conta, listas e histórico, com datas em texto ISO e sem dados de sessão", () => {
    const d = new Date("2026-11-23T10:00:00Z");
    const r = montarExportacao({
      agora: d,
      conta: { name: "Ana", email: "ana@exemplo.com", createdAt: d, historicoLigado: true },
      quero: [{ filmeId: 1, criadoEm: d }],
      assistidos: [{ filmeId: 2, nota: "gostei", criadoEm: d }],
      vistos: [{ filmeId: 3, vistoEm: d }],
      buscas: [{ texto: "duna", buscadoEm: d }],
    });
    expect(r).toEqual({
      geradoEm: "2026-11-23T10:00:00.000Z",
      conta: { nome: "Ana", email: "ana@exemplo.com", criadaEm: "2026-11-23T10:00:00.000Z" },
      historicoLigado: true,
      queroAssistir: [{ filmeId: 1, desde: "2026-11-23T10:00:00.000Z" }],
      assistidos: [{ filmeId: 2, nota: "gostei", desde: "2026-11-23T10:00:00.000Z" }],
      vistosRecentemente: [{ filmeId: 3, em: "2026-11-23T10:00:00.000Z" }],
      buscasRecentes: [{ texto: "duna", em: "2026-11-23T10:00:00.000Z" }],
    });
    expect(JSON.stringify(r)).not.toMatch(/token|session|senha|password/i);
  });
});
