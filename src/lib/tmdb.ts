import "server-only"; // garante que este arquivo (e o token) nunca vá para o navegador

import { cacheLife } from "next/cache";
import { LIMITE_PAGINAS, montarParametrosDiscover } from "./discover";
import { TmdbErro } from "./erros";
import { escolherTrailer, extrairOndeAssistir } from "./filme";
import { extrairAno, urlImagem } from "./formatar";
import type { DetalheFilme, PaginaFilmes, TmdbProvedoresBR, TmdbVideo } from "./tipos";

const BASE = "https://api.themoviedb.org/3";

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

type TmdbDetalhe = {
  id: number;
  title: string;
  release_date?: string;
  vote_average: number;
  runtime: number | null;
  genres: { name: string }[];
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  videos: { results: TmdbVideo[] };
  credits: { cast: { id: number; name: string; character: string; profile_path: string | null }[] };
  "watch/providers": { results: { BR?: TmdbProvedoresBR } };
};

/**
 * Tudo sobre um filme, numa chamada só ("append_to_response" traz vídeos,
 * elenco e onde assistir junto). Devolve null se o filme não existe.
 */
export async function buscarDetalhes(id: number): Promise<DetalheFilme | null> {
  "use cache";
  cacheLife("hours");

  let f: TmdbDetalhe;
  try {
    f = await tmdbFetch<TmdbDetalhe>(`/movie/${id}`, {
      language: "pt-BR",
      append_to_response: "videos,credits,watch/providers",
      include_video_language: "pt,en",
    });
  } catch (erro) {
    if (erro instanceof TmdbErro && erro.status === 404) return null;
    throw erro;
  }

  // Sem sinopse em português? Usa a em inglês.
  let sinopse = f.overview;
  if (!sinopse) {
    const emIngles = await tmdbFetch<{ overview: string }>(`/movie/${id}`, { language: "en-US" });
    sinopse = emIngles.overview;
  }

  return {
    id: f.id,
    titulo: f.title,
    ano: extrairAno(f.release_date),
    nota: f.vote_average,
    duracaoMin: f.runtime,
    generos: f.genres.map((g) => g.name),
    sinopse,
    capa: urlImagem(f.poster_path, "w780"),
    fundo: urlImagem(f.backdrop_path, "w1280"),
    ondeAssistir: extrairOndeAssistir(f["watch/providers"].results.BR),
    trailerKey: escolherTrailer(f.videos.results),
    elenco: f.credits.cast.slice(0, 10).map((a) => ({
      id: a.id,
      nome: a.name,
      personagem: a.character,
      foto: urlImagem(a.profile_path, "w185"),
    })),
  };
}
