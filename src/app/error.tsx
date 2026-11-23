"use client"; // telas de erro precisam rodar no navegador

import { useEffect } from "react";
import styles from "./error.module.css";

/**
 * Aparece no lugar da página quando algo dá errado
 * (por exemplo, o TMDB fora do ar), em vez de uma tela quebrada.
 */
export default function Erro({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Registra o erro no console, para quem estiver investigando
    console.error(error);
  }, [error]);

  return (
    <div className={styles.erro} role="alert">
      <p className={styles.icone} aria-hidden="true">
        🎞️
      </p>
      <h1>Não foi possível carregar os filmes agora.</h1>
      <p>Tente de novo em instantes.</p>
      <button type="button" onClick={() => retry()}>
        Tentar de novo
      </button>
    </div>
  );
}
