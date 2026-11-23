import { Suspense } from "react";
import { FiltroServicos } from "@/components/FiltroServicos";
import { GradeFilmes } from "@/components/GradeFilmes";
import { servicoPorSlug } from "@/lib/servicos";
import { buscarFilmes } from "@/lib/tmdb";
import styles from "./page.module.css";

/** Página inicial: os filmes mais populares disponíveis nos streamings do Brasil. */
export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <h1 className={styles.titulo}>
        Populares agora <small>disponíveis no Brasil, inclusos na assinatura ou grátis</small>
      </h1>
      {/* O filtro depende do endereço (?servico=...), então carrega dentro do Suspense */}
      <Suspense fallback={<p className={styles.carregando}>Carregando filmes…</p>}>
        <Catalogo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Catalogo({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { servico: valor } = await searchParams;
  // Um apelido desconhecido (ex.: ?servico=xpto) vira "Todos"
  const servico = servicoPorSlug(typeof valor === "string" ? valor : undefined);
  const { filmes } = await buscarFilmes(servico?.slug, 1);

  return (
    <>
      <FiltroServicos ativo={servico?.slug} />
      <GradeFilmes filmes={filmes} servico={servico} />
    </>
  );
}
