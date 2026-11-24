import { Suspense } from "react";
import { CarregarMais } from "@/components/CarregarMais";
import { EsqueletoFiltro, EsqueletoGrade } from "@/components/Esqueleto";
import { FiltroGenero } from "@/components/FiltroGenero";
import { FiltroServicos } from "@/components/FiltroServicos";
import { MarcaTema } from "@/components/MarcaTema";
import { GradeFilmes } from "@/components/GradeFilmes";
import { lerGenero } from "@/lib/generos";
import { servicoPorSlug } from "@/lib/servicos";
import { temaDoServico } from "@/lib/temas";
import { buscarFilmes, buscarGeneros } from "@/lib/tmdb";
import type { Genero } from "@/lib/tipos";
import styles from "./page.module.css";

/** Página inicial: os filmes mais populares disponíveis nos streamings do Brasil. */
export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <h1 className={styles.titulo}>
        Populares agora <small>disponíveis agora no Brasil, inclusos na assinatura ou grátis</small>
      </h1>
      {/* O filtro depende do endereço (?servico=...), então carrega dentro do Suspense */}
      <Suspense
        fallback={
          <div role="status">
            <span className="sr-only">Carregando filmes…</span>
            <EsqueletoFiltro />
            <EsqueletoGrade quantidade={20} />
          </div>
        }
      >
        <Catalogo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Catalogo({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { servico: valor, genero: valorGenero } = await searchParams;
  // Um apelido desconhecido (ex.: ?servico=xpto) vira "Todos"
  const servico = servicoPorSlug(typeof valor === "string" ? valor : undefined);
  // A lista de gêneros é só um filtro: se ela falhar, o catálogo segue sem gênero
  const generos = await buscarGeneros().catch((): Genero[] | null => null);
  const genero = lerGenero(valorGenero, generos);
  const { filmes, pagina, totalPaginas } = await buscarFilmes(servico?.slug, 1, genero?.id);

  // Serviços + botão de gênero (o botão só aparece se a lista de gêneros carregou)
  const filtros = (
    <>
    {/* Pinta o site com a cor do serviço escolhido */}
    <MarcaTema tema={temaDoServico(servico?.slug)} />
    <FiltroServicos ativo={servico?.slug} genero={genero?.id}>
      {generos && <FiltroGenero generos={generos} ativo={genero?.id} servico={servico?.slug} />}
    </FiltroServicos>
    </>
  );

  if (filmes.length === 0) {
    return (
      <>
        {filtros}
        <p className={styles.vazio}>Nenhum filme encontrado com estes filtros.</p>
      </>
    );
  }

  return (
    <>
      {filtros}
      {/* As 6 primeiras capas aparecem sem rolar a tela: carregam já */}
      <GradeFilmes filmes={filmes} servico={servico} genero={genero?.id} capasImediatas={6} />
      {/* key: ao trocar de serviço ou gênero, o botão recomeça do zero */}
      <CarregarMais
        key={`${servico?.slug ?? "todos"}-${genero?.id ?? "todos"}`}
        servico={servico?.slug}
        genero={genero?.id}
        paginaInicial={pagina}
        totalPaginas={totalPaginas}
        idsIniciais={filmes.map((f) => f.id)}
      />
    </>
  );
}
