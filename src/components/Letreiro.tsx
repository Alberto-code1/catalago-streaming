"use client"; // roda no navegador: vira as letras quando a frase muda

import { useState } from "react";
import styles from "./Heroi.module.css";

/**
 * A 2ª linha do título ("hoje à noite", "na Netflix"...). Quando a frase muda,
 * as letras viram uma a uma, como num painel de partidas de aeroporto.
 * As letras são só visuais (aria-hidden): o leitor de tela lê a frase inteira, logo ao lado (com o começo do título).
 */
export function Letreiro({ frase }: { frase: string }) {
  // Conta as trocas: a 1ª frase aparece parada, as seguintes viram.
  // (Atualizar o estado durante o desenho, quando a frase muda, é o jeito indicado pelo React.)
  const [estado, setEstado] = useState({ frase, trocas: 0 });
  if (estado.frase !== frase) setEstado({ frase, trocas: estado.trocas + 1 });
  const animar = estado.trocas > 0;

  return (
    <>
      <span className={styles.letreiro} aria-hidden="true" key={estado.trocas}>
        {[...frase].map((letra, k) => (
          <span
            key={k}
            className={animar ? `${styles.letra} ${styles.vira}` : styles.letra}
            style={{ "--k": k } as React.CSSProperties}
          >
            {letra === " " ? " " : letra}
          </span>
        ))}
      </span>
      <span className="sr-only">O que assistir {frase}</span>
    </>
  );
}
