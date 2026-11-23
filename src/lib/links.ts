import { servicoPorSlug } from "./servicos";

/** Endereço da página de um filme, levando junto o filtro escolhido (para o "Voltar" lembrar dele). */
export function hrefFilme(id: number, slug: string | null | undefined): string {
  const servico = servicoPorSlug(slug);
  return servico ? `/filme/${id}?servico=${servico.slug}` : `/filme/${id}`;
}

/** Endereço do catálogo, com o filtro escolhido (ou "Todos", se não houver um válido). */
export function hrefCatalogo(slug: string | null | undefined): string {
  const servico = servicoPorSlug(slug);
  return servico ? `/?servico=${servico.slug}` : "/";
}
