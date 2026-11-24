"use client"; // roda no navegador: anima a troca das capas quando o streaming muda

import { useEffect, useRef, useState } from "react";
import styles from "./ParedePosteres.module.css";

const FILEIRAS = 3;
const POR_FILEIRA = 10;
/** Atraso entre uma capa e a seguinte na "cascata" (ms) e duração do giro (ms). */
const PASSO = 45;
const GIRO = 800;

/** Qual capa vai em cada posição: cada fileira começa num ponto diferente da lista. */
function capaDaPosicao(capas: string[], fileira: number, j: number): string {
  return capas[(fileira * 7 + j) % capas.length];
}

function movimentoReduzido(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A parede do topo: 3 fileiras inclinadas de capas deslizando devagar.
 * Quando chegam capas novas (outro streaming), elas viram uma a uma, como cartas,
 * e cada capa troca de imagem no meio do giro.
 */
export function ParedePosteres({ capas }: { capas: string[] }) {
  // As capas que o React desenha. Durante a cascata, a troca é feita direto nas imagens.
  const [mostradas, setMostradas] = useState(capas);
  const [virando, setVirando] = useState(false);
  const parede = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const chave = capas.join("|");

  useEffect(() => {
    if (chave === mostradas.join("|")) return;
    const novas = chave.split("|");
    // Uma troca nova cancela a que ainda estava acontecendo
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (movimentoReduzido() || !parede.current) {
      setMostradas(novas);
      return;
    }

    setVirando(false);
    requestAnimationFrame(() => setVirando(true));
    let maior = 0;
    parede.current.querySelectorAll<HTMLImageElement>("img[data-j]").forEach((img) => {
      const f = Number(img.dataset.f);
      const j = Number(img.dataset.j);
      const ordem = j + f * 3;
      maior = Math.max(maior, ordem);
      // Troca a imagem no meio do giro, quando a capa está "de lado" e não aparece
      timers.current.push(
        window.setTimeout(() => {
          img.src = capaDaPosicao(novas, f, j);
        }, GIRO / 2 + ordem * PASSO),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        setVirando(false);
        setMostradas(novas);
      }, GIRO + maior * PASSO + 50),
    );
  }, [chave, mostradas]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (mostradas.length === 0) return null;

  return (
    <div ref={parede} className={virando ? `${styles.parede} ${styles.virando}` : styles.parede} data-testid="parede" aria-hidden="true">
      {Array.from({ length: FILEIRAS }, (_, f) => (
        <div key={f} className={styles.fileira} data-fileira>
          {/* Cada fileira repete as capas 2 vezes, para o deslize não ter emenda */}
          {Array.from({ length: POR_FILEIRA * 2 }, (_, k) => {
            const j = k % POR_FILEIRA;
            return (
              // Capas pequenas (154px) vindas direto do TMDB: leves e já no tamanho certo
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={k}
                src={capaDaPosicao(mostradas, f, j)}
                alt=""
                width={154}
                height={231}
                decoding="async"
                data-f={f}
                data-j={j}
                style={{ "--ordem": j + f * 3 } as React.CSSProperties}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
