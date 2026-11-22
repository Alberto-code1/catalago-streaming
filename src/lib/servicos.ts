import type { Servico } from "./tipos";

/**
 * Os serviços dos botões de filtro, na ordem em que aparecem.
 * `providerId` é o código do serviço no TMDB para o Brasil
 * (conferido com scripts/listar-servicos.mjs).
 */
export const SERVICOS: Servico[] = [
  { slug: "netflix", nome: "Netflix", providerId: 8, cor: "#e50914" },
  { slug: "prime", nome: "Prime Video", providerId: 119, cor: "#00a8e1" },
  { slug: "disney", nome: "Disney+", providerId: 337, cor: "#113ccf" },
  { slug: "max", nome: "HBO Max", providerId: 1899, cor: "#5822b4" },
  { slug: "globoplay", nome: "Globoplay", providerId: 307, cor: "#ff3d00" },
];

/** Acha o serviço pelo apelido usado na URL (ex.: "netflix"). */
export function servicoPorSlug(slug: string | null | undefined): Servico | undefined {
  return SERVICOS.find((s) => s.slug === slug);
}

/** Códigos de todos os serviços juntos com "|", que no TMDB significa "OU". */
export function idsDeTodos(): string {
  return SERVICOS.map((s) => s.providerId).join("|");
}
