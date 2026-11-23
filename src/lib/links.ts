import { servicoPorSlug } from "./servicos";

/** Monta o "?servico=...&genero=..." (só com os filtros válidos, nessa ordem). */
function filtros(slug: string | null | undefined, genero?: number): string {
  const params = new URLSearchParams();
  const servico = servicoPorSlug(slug);
  if (servico) params.set("servico", servico.slug);
  if (genero !== undefined) params.set("genero", String(genero));
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}

/** Endereço da página de um filme, levando junto os filtros escolhidos (para o "Voltar" lembrar deles). */
export function hrefFilme(id: number, slug: string | null | undefined, genero?: number): string {
  return `/filme/${id}${filtros(slug, genero)}`;
}

/** Endereço do catálogo com os filtros escolhidos (sem filtros válidos = "Todos"). */
export function hrefCatalogo(slug: string | null | undefined, genero?: number): string {
  return `/${filtros(slug, genero)}`;
}
