"use client"; // lê no navegador a lista de filmes que a pessoa já assistiu

import styles from "./CartaoFilme.module.css";
import { useEstadoPessoal } from "./estadoPessoal";

/** A marquinha "✓ visto" sobre a capa. Para visitantes (ou filme não assistido), não mostra nada. */
export function MarcaVisto({ filmeId }: { filmeId: number }) {
  const { assistidos } = useEstadoPessoal();
  if (!assistidos.has(filmeId)) return null;
  return (
    <span className={styles.visto} data-testid="marca-visto">
      ✓ visto
    </span>
  );
}
