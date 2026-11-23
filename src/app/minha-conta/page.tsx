import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EsqueletoGrade } from "@/components/Esqueleto";
import { type FilmeDaLista, ItemLista, resumoDaLista } from "@/components/ItemLista";
import { Paginacao } from "@/components/Paginacao";
import grade from "@/components/GradeFilmes.module.css";
import { listarQuero } from "@/lib/dados/listas";
import { lerPagina } from "@/lib/discover";
import { type Aba, LIMITES, lerAba } from "@/lib/listas";
import { exigirUsuario, type Usuario } from "@/lib/sessao";
import { buscarDetalhes } from "@/lib/tmdb";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false },
};

const ABAS: { aba: Aba; nome: string }[] = [
  { aba: "quero", nome: "Quero assistir" },
  { aba: "assistidos", nome: "Já assisti" },
  { aba: "recentes", nome: "Vistos recentemente" },
];

/** Minha conta: /minha-conta?aba=quero|assistidos|recentes&pagina=N */
export default function PaginaMinhaConta({ searchParams }: PageProps<"/minha-conta">) {
  return (
    <section className={styles.pagina}>
      <Suspense
        fallback={
          <div role="status">
            <span className="sr-only">Carregando sua conta…</span>
            <EsqueletoGrade quantidade={6} />
          </div>
        }
      >
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/minha-conta">, "searchParams">) {
  const params = await searchParams;
  const aba = lerAba(params.aba);
  const pagina = lerPagina(typeof params.pagina === "string" ? params.pagina : null);
  const usuario = await exigirUsuario(aba === "quero" ? "/minha-conta" : `/minha-conta?aba=${aba}`);

  return (
    <>
      <h1>Minha conta</h1>
      <p className={styles.ola}>Olá, {usuario.nome}!</p>

      <nav aria-label="Suas listas" className={styles.abas}>
        {ABAS.map((a) => (
          <Link
            key={a.aba}
            href={a.aba === "quero" ? "/minha-conta" : `/minha-conta?aba=${a.aba}`}
            aria-current={a.aba === aba ? "page" : undefined}
          >
            {a.nome}
          </Link>
        ))}
      </nav>

      <Lista usuario={usuario} aba={aba} pagina={pagina} />
    </>
  );
}

/** O conteúdo de uma aba: os filmes, com o aviso de lista vazia e a paginação. */
async function Lista({ usuario, aba, pagina }: { usuario: Usuario; aba: Aba; pagina: number }) {
  let dados: { itens: { id: number; nota?: FilmeDaLista["nota"] }[]; total: number };
  try {
    dados = await carregar(usuario, aba, pagina);
  } catch (erro) {
    console.error("Falha ao carregar a lista:", erro);
    return <p className={styles.vazio}>Não foi possível carregar sua lista agora. Tente de novo em instantes.</p>;
  }

  if (dados.total === 0) return <p className={styles.vazio}>{VAZIO[aba]}</p>;

  // Título, capa e "onde está agora" vêm do TMDB (com cache); se falhar para um filme, ele aparece só com o número
  const itens: FilmeDaLista[] = await Promise.all(
    dados.itens.map(async ({ id, nota }) => ({
      id,
      nota,
      filme: resumoDaLista(id, await buscarDetalhes(id).catch(() => null)),
    })),
  );

  return (
    <>
      <p className={styles.total}>
        {dados.total} {dados.total === 1 ? "filme" : "filmes"}
      </p>
      <div className={grade.grade}>
        {itens.map((item) => (
          <ItemLista key={item.id} item={item} lista={aba} />
        ))}
      </div>
      <Paginacao aba={aba} pagina={pagina} totalPaginas={Math.ceil(dados.total / LIMITES.porPagina)} />
    </>
  );
}

const VAZIO: Record<Aba, string> = {
  quero: "Sua lista está vazia. Abra um filme e toque em '+ Quero assistir'.",
  assistidos: "Nenhum filme marcado como assistido ainda.",
  recentes: "Os filmes que você abrir aparecem aqui.",
};

/** Busca no banco os ids da aba pedida. */
async function carregar(usuario: Usuario, aba: Aba, pagina: number) {
  if (aba === "quero") {
    const { ids, total } = await listarQuero(usuario.id, pagina);
    return { itens: ids.map((id) => ({ id })), total };
  }
  // As abas "Já assisti" e "Vistos recentemente" chegam nas próximas etapas
  return { itens: [], total: 0 };
}
