import Link from "next/link";
import styles from "./Rodape.module.css";

/** Rodapé com os créditos exigidos pelo TMDB e pelo JustWatch. */
export function Rodape() {
  return (
    <footer className={styles.rodape}>
      Dados de filmes:{" "}
      <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
        TMDB
      </a>{" "}
      · Onde assistir:{" "}
      <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer">
        JustWatch
      </a>{" "}
      · <Link href="/sobre">Sobre o site</Link>
    </footer>
  );
}
