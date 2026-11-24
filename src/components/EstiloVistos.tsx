"use client"; // roda no navegador: lê a lista de filmes que a pessoa já assistiu

import { useEstadoPessoal } from "./estadoPessoal";

/**
 * Uma peça só para a página inteira: mostra a marquinha "✓ visto" nos filmes assistidos.
 * Cada cartão já vem com a marquinha escondida; esta folha de estilo libera as certas.
 * (Antes era um componente por cartão, o que deixava o celular mais lento.)
 */
export function EstiloVistos() {
  const { assistidos } = useEstadoPessoal();
  if (assistidos.size === 0) return null;
  const regras = [...assistidos].map((id) => `[data-filme="${id}"] [data-visto]`).join(",");
  return <style>{`${regras}{display:inline-flex}`}</style>;
}
