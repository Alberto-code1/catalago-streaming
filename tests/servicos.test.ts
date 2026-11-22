import { describe, expect, test } from "vitest";
import { SERVICOS, idsDeTodos, servicoPorSlug } from "@/lib/servicos";

describe("lista de serviços", () => {
  test("tem os 5 serviços na ordem dos botões", () => {
    expect(SERVICOS.map((s) => s.slug)).toEqual(["netflix", "prime", "disney", "max", "globoplay"]);
  });

  test("usa os códigos do TMDB para o Brasil", () => {
    expect(SERVICOS.map((s) => s.providerId)).toEqual([8, 119, 337, 1899, 307]);
  });
});

describe("servicoPorSlug", () => {
  test("acha um serviço pelo apelido da URL", () => {
    expect(servicoPorSlug("netflix")?.nome).toBe("Netflix");
    expect(servicoPorSlug("max")?.nome).toBe("HBO Max");
  });

  test("devolve undefined para apelido desconhecido ou vazio", () => {
    expect(servicoPorSlug("xpto")).toBeUndefined();
    expect(servicoPorSlug(null)).toBeUndefined();
    expect(servicoPorSlug(undefined)).toBeUndefined();
  });
});

describe("idsDeTodos", () => {
  test("junta os códigos com | (que no TMDB quer dizer OU)", () => {
    expect(idsDeTodos()).toBe("8|119|337|1899|307");
  });
});
