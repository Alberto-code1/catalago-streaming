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
