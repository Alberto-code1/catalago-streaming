import "server-only"; // garante que este arquivo (e o token) nunca vá para o navegador

import { cacheLife } from "next/cache";
import { LIMITE_PAGINAS, montarParametrosDiscover } from "./discover";
import { extrairAno, urlImagem } from "./formatar";
import type { PaginaFilmes } from "./tipos";

const BASE = "https://api.themoviedb.org/3";

/** Erro de conversa com o TMDB, com o código HTTP (ex.: 404 = não encontrado). */
export class TmdbErro extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "TmdbErro";
  }
}

/**
 * Faz um pedido ao TMDB usando o token secreto e devolve a resposta já convertida.
 * Ex.: tmdbFetch("/discover/movie", { page: 1 })
 * O cache fica nas funções que chamam esta (com "use cache").
 */
export async function tmdbFetch<T>(caminho: string, params: Record<string, string | number> = {}): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) throw new TmdbErro("TMDB_READ_TOKEN não configurado", 500);

  const url = new URL(BASE + caminho);
  for (const [chave, valor] of Object.entries(params)) url.searchParams.set(chave, String(valor));

  const resposta = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
  if (!resposta.ok) throw new TmdbErro(`TMDB respondeu ${resposta.status} em ${caminho}`, resposta.status);
  return (await resposta.json()) as T;
}

type TmdbDiscover = {
  page: number;
  total_pages: number;
  results: { id: number; title: string; release_date?: string; vote_average: number; poster_path: string | null }[];
};

/**
 * Uma página do catálogo: filmes disponíveis no Brasil, do serviço escolhido (ou de todos).
 * "use cache" guarda o resultado por algumas horas, para o site ficar rápido.
 */
export async function buscarFilmes(slug: string | null | undefined, pagina: number): Promise<PaginaFilmes> {
  "use cache";
  cacheLife("hours");

  const dados = await tmdbFetch<TmdbDiscover>("/discover/movie", montarParametrosDiscover(slug, pagina));
  return {
    pagina: dados.page,
    totalPaginas: Math.min(dados.total_pages, LIMITE_PAGINAS),
    filmes: dados.results.map((f) => ({
      id: f.id,
      titulo: f.title,
      ano: extrairAno(f.release_date),
      nota: f.vote_average,
      capa: urlImagem(f.poster_path, "w342"),
    })),
  };
}
