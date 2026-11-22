import { describe, expect, test } from "vitest";
import { montarParametrosDiscover } from "@/lib/discover";
import { idsDeTodos } from "@/lib/servicos";

const base = {
  watch_region: "BR",
  with_watch_monetization_types: "flatrate|free|ads",
  sort_by: "popularity.desc",
  language: "pt-BR",
};

describe("montarParametrosDiscover", () => {
  test("filtra por um serviço quando ele é escolhido", () => {
    expect(montarParametrosDiscover("netflix", 1)).toEqual({ ...base, page: "1", with_watch_providers: "8" });
  });

  test("em 'Todos', usa os 5 serviços juntos", () => {
    expect(montarParametrosDiscover(undefined, 2)).toEqual({ ...base, page: "2", with_watch_providers: idsDeTodos() });
  });

  test("serviço desconhecido na URL vira 'Todos'", () => {
    expect(montarParametrosDiscover("xpto", 1).with_watch_providers).toBe(idsDeTodos());
  });
});
