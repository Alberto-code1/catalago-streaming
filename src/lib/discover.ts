import { idsDeTodos, servicoPorSlug } from "./servicos";

/**
 * Monta os parâmetros do pedido "/discover/movie" ao TMDB:
 * filmes disponíveis no Brasil, na assinatura ou grátis, mais populares primeiro.
 * Sem serviço (ou com um apelido desconhecido), busca nos 5 serviços juntos.
 */
export function montarParametrosDiscover(slug: string | null | undefined, pagina: number): Record<string, string> {
  const servico = servicoPorSlug(slug);
  return {
    watch_region: "BR",
    with_watch_monetization_types: "flatrate|free|ads",
    sort_by: "popularity.desc",
    language: "pt-BR",
    page: String(pagina),
    with_watch_providers: servico ? String(servico.providerId) : idsDeTodos(),
  };
}
