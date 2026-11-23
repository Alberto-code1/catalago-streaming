import type { Genero } from "./tipos";

type ValorDoEndereco = string | string[] | undefined | null;

/**
 * Lê o id do gênero vindo do endereço (?genero=35), só se for um inteiro positivo.
 * Não confere se o gênero existe (usado no "Voltar", que não consulta o TMDB).
 */
export function lerIdGenero(valor: ValorDoEndereco): number | undefined {
  if (typeof valor !== "string" || !/^[1-9]\d*$/.test(valor)) return undefined;
  return Number(valor);
}

/**
 * Acha o gênero escolhido na lista do TMDB. Qualquer coisa estranha
 * (id inexistente, texto, dois gêneros, lista indisponível) vira "Todos" (undefined).
 */
export function lerGenero(valor: ValorDoEndereco, generos: Genero[] | null): Genero | undefined {
  const id = lerIdGenero(valor);
  if (id === undefined || !generos) return undefined;
  return generos.find((g) => g.id === id);
}
