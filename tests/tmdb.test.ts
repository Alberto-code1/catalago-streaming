import { afterEach, describe, expect, test, vi } from "vitest";
import { ehErroTmdb } from "@/lib/erros";
import { tmdbFetch } from "@/lib/tmdb";

describe("tmdbFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  test("falha de rede (internet caiu, DNS) vira erro do TMDB com status 503", async () => {
    vi.stubEnv("TMDB_READ_TOKEN", "token-de-teste");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const erro = await tmdbFetch("/discover/movie").catch((e: unknown) => e);
    expect(ehErroTmdb(erro)).toBe(true);
    expect((erro as { status: number }).status).toBe(503);
  });

  test("TMDB que não responde: desiste após o tempo limite com erro 504", async () => {
    vi.useFakeTimers();
    vi.stubEnv("TMDB_READ_TOKEN", "token-de-teste");
    // Um TMDB "travado": só termina se o pedido for cancelado
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: URL, opcoes?: RequestInit) =>
          new Promise((_ok, falha) => {
            opcoes?.signal?.addEventListener("abort", () => falha(new DOMException("cancelado", "AbortError")));
          }),
      ),
    );

    const promessa = tmdbFetch("/discover/movie").catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(10_000);
    const erro = await promessa;

    expect(ehErroTmdb(erro)).toBe(true);
    expect((erro as { status: number }).status).toBe(504);
  });
});
