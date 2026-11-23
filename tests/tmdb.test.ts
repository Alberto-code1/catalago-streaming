import { afterEach, describe, expect, test, vi } from "vitest";
import { ehErroTmdb } from "@/lib/erros";
import { tmdbFetch } from "@/lib/tmdb";

describe("tmdbFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("falha de rede (internet caiu, DNS) vira erro do TMDB com status 503", async () => {
    vi.stubEnv("TMDB_READ_TOKEN", "token-de-teste");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const erro = await tmdbFetch("/discover/movie").catch((e: unknown) => e);
    expect(ehErroTmdb(erro)).toBe(true);
    expect((erro as { status: number }).status).toBe(503);
  });
});
