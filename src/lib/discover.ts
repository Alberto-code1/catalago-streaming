import { idsDeTodos, servicoPorSlug } from "./servicos";
import type { FilmeResumo } from "./tipos";

/** O TMDB nunca devolve mais que 500 páginas de uma busca. */
export const LIMITE_PAGINAS = 500;

/**
 * Lê o número da página vindo do endereço, com segurança:
 * texto inválido, zero ou negativo vira 1; acima de 500 vira 500.
 */
export function lerPagina(valor: string | null): number {
  const numero = Math.floor(Number(valor));
  if (!Number.isFinite(numero) || numero < 1) return 1;
  return Math.min(numero, LIMITE_PAGINAS);
}

/**
 * Junta os filmes novos aos que já estão na tela, sem repetir nenhum.
 * (A popularidade muda entre um pedido e outro, então o mesmo filme
 * pode aparecer em duas páginas.)
 */
export function juntarSemRepetir(atuais: FilmeResumo[], novos: FilmeResumo[]): FilmeResumo[] {
  const vistos = new Set(atuais.map((f) => f.id));
  const resultado = [...atuais];
  for (const filme of novos) {
    if (!vistos.has(filme.id)) {
      vistos.add(filme.id);
      resultado.push(filme);
    }
  }
  return resultado;
}

/**
 * Monta os parâmetros do pedido "/discover/movie" ao TMDB:
 * filmes disponíveis no Brasil, na assinatura ou grátis, mais populares primeiro.
 * Sem serviço (ou com um apelido desconhecido), busca nos 5 serviços juntos.
 * Com gênero (id do TMDB), mostra só filmes daquele gênero.
 */
export function montarParametrosDiscover(
  slug: string | null | undefined,
  pagina: number,
  genero?: number,
): Record<string, string> {
  const servico = servicoPorSlug(slug);
  return {
    ...(genero !== undefined && { with_genres: String(genero) }),
    watch_region: "BR",
    with_watch_monetization_types: "flatrate|free|ads",
    sort_by: "popularity.desc",
    language: "pt-BR",
    page: String(pagina),
    with_watch_providers: servico ? String(servico.providerId) : idsDeTodos(),
  };
}
