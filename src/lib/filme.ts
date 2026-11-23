import { urlImagem } from "./formatar";
import type { Provedor, TmdbProvedoresBR, TmdbVideo } from "./tipos";

/**
 * Escolhe o trailer do YouTube: primeiro em português, depois em inglês.
 * Em cada idioma, prefere o oficial. Devolve o código do vídeo, ou null.
 */
export function escolherTrailer(videos: TmdbVideo[]): string | null {
  const trailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  for (const idioma of ["pt", "en"]) {
    const doIdioma = trailers.filter((v) => v.iso_639_1 === idioma);
    const escolhido = doIdioma.find((v) => v.official) ?? doIdioma[0];
    if (escolhido) return escolhido.key;
  }
  return null;
}

/**
 * Lista os serviços onde o filme está no Brasil (assinatura, grátis ou com anúncios),
 * sem repetir e nessa ordem.
 */
export function extrairOndeAssistir(br: TmdbProvedoresBR | undefined): Provedor[] {
  if (!br) return [];
  const todos = [...(br.flatrate ?? []), ...(br.free ?? []), ...(br.ads ?? [])];
  const vistos = new Set<number>();
  const resultado: Provedor[] = [];
  for (const p of todos) {
    if (vistos.has(p.provider_id)) continue;
    vistos.add(p.provider_id);
    resultado.push({ id: p.provider_id, nome: p.provider_name, logo: urlImagem(p.logo_path, "w92") });
  }
  return resultado;
}
