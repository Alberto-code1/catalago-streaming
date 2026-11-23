// Regras pequenas (sem banco) das listas e do histórico.

import { normalizarBusca } from "./busca";

/** Os limites combinados no design da Fase 3. */
export const LIMITES = { quero: 500, assistidos: 2000, vistos: 20, buscas: 5, porPagina: 24 } as const;

/** O maior número que cabe na coluna "filme_id" do banco (integer do Postgres). */
const MAIOR_ID = 2_147_483_647;

/**
 * Confere o id de um filme vindo de fora (botão, endereço): só aceita um inteiro
 * positivo que caiba no banco. Qualquer outra coisa vira null e a ação é recusada.
 */
export function lerIdFilme(valor: unknown): number | null {
  const texto = typeof valor === "number" ? String(valor) : valor;
  if (typeof texto !== "string" || !/^[1-9]\d{0,9}$/.test(texto)) return null;
  const id = Number(texto);
  return id <= MAIOR_ID ? id : null;
}

/** A nota de um filme assistido: gostei, não gostei ou nenhuma. */
export type Nota = "gostei" | "nao_gostei" | null;

/** Confere uma nota vinda do navegador. undefined = valor inválido (a ação é recusada). */
export function lerNota(valor: unknown): Nota | undefined {
  return valor === "gostei" || valor === "nao_gostei" || valor === null ? valor : undefined;
}

/** As abas da página Minha conta. */
export type Aba = "quero" | "assistidos" | "recentes";

/** Lê a aba do endereço (?aba=...); qualquer valor estranho vira "quero". */
export function lerAba(valor: unknown): Aba {
  return valor === "assistidos" || valor === "recentes" ? valor : "quero";
}

/**
 * A "chave" de uma busca recente: o texto limpo (como na página de busca) e em minúsculas.
 * "Duna" e "  duna " são a mesma busca e não se repetem na lista.
 */
export function chaveBusca(texto: string): string {
  return (normalizarBusca(texto) ?? texto.trim()).toLowerCase();
}
