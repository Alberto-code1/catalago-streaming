import { useSyncExternalStore } from "react";

/**
 * O "estado pessoal" no navegador: se a pessoa está logada, quais filmes ela já assistiu
 * e suas buscas recentes. É preenchido pelo menu da conta no topo e lido pelos cartões
 * ("✓ visto") e pela caixa de busca, sem pedidos extras ao servidor.
 */
export type EstadoPessoal = {
  logado: boolean;
  assistidos: ReadonlySet<number>;
  buscas: readonly string[];
  historico: boolean;
};

export const ESTADO_VAZIO: EstadoPessoal = { logado: false, assistidos: new Set(), buscas: [], historico: true };

let estado = ESTADO_VAZIO;
const ouvintes = new Set<() => void>();

/** Atualiza parte do estado e avisa quem está mostrando algo com ele. */
export function definirEstado(parcial: Partial<EstadoPessoal>): void {
  estado = { ...estado, ...parcial };
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

/** Lê o estado pessoal num componente do navegador (no servidor, sempre "não logado"). */
export function useEstadoPessoal(): EstadoPessoal {
  return useSyncExternalStore(assinar, () => estado, () => ESTADO_VAZIO);
}
