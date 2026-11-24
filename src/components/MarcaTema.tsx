import type { Tema } from "@/lib/temas";

/**
 * Não aparece na tela: avisa o CSS qual tema de cor usar.
 * O globals.css tem regras do tipo `body:has([data-tema="netflix"])`, que trocam as cores do site inteiro.
 */
export function MarcaTema({ tema }: { tema: Tema }) {
  return <span data-tema={tema} hidden />;
}
