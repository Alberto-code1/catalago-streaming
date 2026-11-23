import { SERVICOS } from "./servicos";
import type { FilmeResumo, ResultadoBusca, Servico } from "./tipos";

/** A busca só roda com pelo menos 2 letras e vai até 100 caracteres. */
const MINIMO = 2;
const MAXIMO = 100;

/**
 * Limpa o texto digitado na busca: tira espaços das pontas e repetidos, corta em 100.
 * Devolve null quando não dá para buscar (vazio, 1 letra, dois textos no endereço).
 */
export function normalizarBusca(valor: string | string[] | undefined | null): string | null {
  if (typeof valor !== "string") return null;
  const texto = valor.trim().replace(/\s+/g, " ").slice(0, MAXIMO).trim();
  return texto.length >= MINIMO ? texto : null;
}

/**
 * Quais dos 5 serviços do site têm o filme, a partir dos códigos de serviço do TMDB.
 * null = não deu para saber; [] = está em nenhum dos 5.
 */
export function servicosDisponiveis(ids: number[] | null): Servico[] | null {
  if (!ids) return null;
  return SERVICOS.filter((s) => ids.includes(s.providerId));
}

/** O texto do selo: "✓ Netflix, Prime Video", "✓ A, B, C +2", "Indisponível" ou nenhum (null). */
export function textoSelo(servicos: Servico[] | null): string | null {
  if (!servicos) return null;
  if (servicos.length === 0) return "Indisponível";
  const nomes = servicos.slice(0, 3).map((s) => s.nome).join(", ");
  const resto = servicos.length - 3;
  return resto > 0 ? `✓ ${nomes} +${resto}` : `✓ ${nomes}`;
}

/**
 * Junta os filmes da busca com os serviços de cada um (na mesma ordem)
 * e coloca os disponíveis primeiro, sem bagunçar a relevância dentro de cada grupo.
 */
export function montarResultados(filmes: FilmeResumo[], ids: (number[] | null)[], total: number): ResultadoBusca {
  const comServicos = filmes.map((filme, i) => ({ ...filme, servicos: servicosDisponiveis(ids[i] ?? null) }));
  const disponiveis = comServicos.filter((f) => f.servicos && f.servicos.length > 0);
  const outros = comServicos.filter((f) => !f.servicos || f.servicos.length === 0);
  return { filmes: [...disponiveis, ...outros], temMais: total > 20 };
}
