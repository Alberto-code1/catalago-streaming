import { GradeFilmes } from "@/components/GradeFilmes";
import { buscarFilmes } from "@/lib/tmdb";
import styles from "./page.module.css";

/** Página inicial: os filmes mais populares disponíveis nos streamings do Brasil. */
export default async function Home() {
  const { filmes } = await buscarFilmes(undefined, 1);

  return (
    <>
      <h1 className={styles.titulo}>
        Populares agora <small>disponíveis no Brasil, inclusos na assinatura ou grátis</small>
      </h1>
      <GradeFilmes filmes={filmes} />
    </>
  );
}
