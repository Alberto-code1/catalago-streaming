import type { Metadata } from "next";
import { Suspense } from "react";
import { EsqueletoGrade } from "@/components/Esqueleto";
import { GradeBusca } from "@/components/GradeBusca";
import { RegistrarBusca } from "@/components/RegistrarBusca";
import { normalizarBusca } from "@/lib/busca";
import { buscarResultados } from "@/lib/tmdb";
import styles from "./page.module.css";

export async function generateMetadata({ searchParams }: PageProps<"/busca">): Promise<Metadata> {
  const texto = normalizarBusca((await searchParams).q);
  return {
    title: texto ? `Busca: ${texto}` : "Busca",
    // Páginas de busca não devem aparecer no Google
    robots: { index: false },
  };
}

/** Página de resultados da busca por nome: /busca?q=duna */
export default function PaginaBusca({ searchParams }: PageProps<"/busca">) {
  return (
    <Suspense
      fallback={
        <div role="status">
          <span className="sr-only">Buscando filmes…</span>
          <EsqueletoGrade quantidade={20} />
        </div>
      }
    >
      <Resultados searchParams={searchParams} />
    </Suspense>
  );
}

async function Resultados({ searchParams }: Pick<PageProps<"/busca">, "searchParams">) {
  const texto = normalizarBusca((await searchParams).q);

  if (!texto) {
    return (
      <>
        <h1 className={styles.titulo}>Buscar filmes</h1>
        <p className={styles.aviso}>Digite pelo menos 2 letras para buscar.</p>
      </>
    );
  }

  const { filmes, temMais } = await buscarResultados(texto);

  return (
    <>
      <h1 className={styles.titulo}>
        Resultados para &quot;{texto}&quot;
        <small>a busca procura em todos os filmes, disponíveis ou não</small>
      </h1>
      {filmes.length === 0 ? (
        <p className={styles.aviso}>Nenhum filme encontrado para &quot;{texto}&quot;.</p>
      ) : (
        <>
          <GradeBusca filmes={filmes} />
          {/* Guarda em "Buscas recentes" (só para quem está logado) */}
          <RegistrarBusca texto={texto} />
          {temMais && <p className={styles.aviso}>Mostrando os 20 mais relevantes. Tente um nome mais específico.</p>}
        </>
      )}
    </>
  );
}
