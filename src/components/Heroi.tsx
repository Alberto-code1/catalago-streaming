import { Suspense } from "react";
import { lerIdGenero } from "@/lib/generos";
import { servicoPorSlug } from "@/lib/servicos";
import { fraseDoTema, temaDoServico } from "@/lib/temas";
import { buscarFilmes } from "@/lib/tmdb";
import { Letreiro } from "./Letreiro";
import { ParedePosteres } from "./ParedePosteres";
import styles from "./Heroi.module.css";

type Busca = PageProps<"/">["searchParams"];

/**
 * O topo da página inicial: a parede de capas viva e o título "O que assistir ...".
 * A 1ª linha do título aparece na hora (é o maior texto da tela). A 2ª linha e a parede
 * dependem do streaming escolhido no endereço, então chegam logo depois.
 */
export function Heroi({ searchParams }: { searchParams: Busca }) {
  return (
    <section className={styles.heroi}>
      <Suspense fallback={null}>
        <Parede searchParams={searchParams} />
      </Suspense>
      <div className={styles.chamada}>
        <h1 className={styles.titulo}>
          <span aria-hidden="true">O que assistir</span>
          <Suspense fallback={<Letreiro frase={fraseDoTema("todos")} />}>
            <FraseDoServico searchParams={searchParams} />
          </Suspense>
        </h1>
        <p className={styles.sub}>
          Os filmes disponíveis agora na Netflix, Prime Video, Disney+, HBO Max e Globoplay, incluídos na assinatura ou
          grátis.
        </p>
      </div>
    </section>
  );
}

async function servicoDaBusca(searchParams: Busca) {
  const { servico, genero } = await searchParams;
  return {
    servico: servicoPorSlug(typeof servico === "string" ? servico : undefined),
    genero: lerIdGenero(genero),
  };
}

async function FraseDoServico({ searchParams }: { searchParams: Busca }) {
  const { servico } = await servicoDaBusca(searchParams);
  return <Letreiro frase={fraseDoTema(temaDoServico(servico?.slug))} />;
}

/** As capas da parede: as mesmas do catálogo (o pedido ao TMDB já está em cache), em tamanho pequeno. */
async function Parede({ searchParams }: { searchParams: Busca }) {
  const { servico, genero } = await servicoDaBusca(searchParams);
  const { filmes } = await buscarFilmes(servico?.slug, 1, genero).catch(() => ({ filmes: [] }));
  const capas = filmes.flatMap((f) => (f.capa ? [f.capa.replace("/w342/", "/w154/")] : []));
  return <ParedePosteres capas={capas} />;
}
