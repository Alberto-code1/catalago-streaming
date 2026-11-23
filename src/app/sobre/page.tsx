import type { Metadata } from "next";
import Link from "next/link";
import { SERVICOS } from "@/lib/servicos";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sobre",
  description: "O que é o Catálogo Streaming, de onde vêm os dados e por que ele existe.",
};

/** Página "Sobre": o que é o site, créditos e avisos. */
export default function Sobre() {
  const nomes = SERVICOS.map((s) => s.nome);
  const listaServicos = `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;

  return (
    <article className={styles.sobre}>
      <h1>Sobre o Catálogo Streaming</h1>

      <p>
        O Catálogo Streaming mostra os filmes disponíveis <strong>agora</strong> no Brasil na {listaServicos}, incluídos
        na assinatura ou grátis. Para cada filme, você encontra a sinopse, o trailer, o elenco e em quais serviços ele
        está.
      </p>

      <h2>Um projeto de estudo</h2>
      <p>
        Este site foi criado para aprender a construir um site completo e moderno, do zero até a publicação, usando o
        Claude Code. Ele não tem fins comerciais.
      </p>

      <h2>De onde vêm os dados</h2>
      <p>
        As informações dos filmes (títulos, sinopses, imagens, elenco e trailers) vêm do{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
          The Movie Database (TMDB)
        </a>
        . A disponibilidade nos serviços de streaming vem do{" "}
        <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer">
          JustWatch
        </a>
        , por meio do TMDB.
      </p>
      <p className={styles.aviso}>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      <p>
        A disponibilidade muda com frequência. Confira sempre no próprio serviço antes de assinar ou assistir.
      </p>

      <p>
        <Link href="/" className={styles.voltar}>
          ← Voltar ao catálogo
        </Link>
      </p>
    </article>
  );
}
