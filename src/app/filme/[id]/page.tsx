import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AreaPessoalFilme } from "@/components/AreaPessoalFilme";
import { Elenco } from "@/components/Elenco";
import { EsqueletoFilme } from "@/components/Esqueleto";
import { Trailer } from "@/components/Trailer";
import { formatarDuracao, formatarNota, resumir } from "@/lib/formatar";
import { lerIdGenero } from "@/lib/generos";
import { hrefCatalogo } from "@/lib/links";
import { buscarDetalhes, buscarFilmes } from "@/lib/tmdb";
import styles from "./page.module.css";

/**
 * Na publicação, já deixa prontas as páginas dos 20 filmes mais populares.
 * Se o TMDB falhar nessa hora, não derruba nada: usa só um filme conhecido
 * ("A Origem") e os outros são montados na primeira visita.
 */
export async function generateStaticParams() {
  try {
    const { filmes } = await buscarFilmes(undefined, 1);
    return filmes.map((f) => ({ id: String(f.id) }));
  } catch {
    return [{ id: "27205" }];
  }
}

/** Transforma o texto do endereço num id válido (número inteiro positivo), ou null. */
function lerId(texto: string): number | null {
  return /^[1-9]\d*$/.test(texto) ? Number(texto) : null;
}

export async function generateMetadata({ params }: PageProps<"/filme/[id]">): Promise<Metadata> {
  const id = lerId((await params).id);
  try {
    const filme = id ? await buscarDetalhes(id) : null;
    if (!filme) return { title: "Filme não encontrado" };

    // Título, descrição e imagem que aparecem no Google e ao compartilhar o link
    const descricao = resumir(filme.sinopse, 160) || `Onde assistir ${filme.titulo} nos streamings do Brasil.`;
    const imagem = filme.fundo ?? filme.capa;
    return {
      title: filme.ano ? `${filme.titulo} (${filme.ano})` : filme.titulo,
      description: descricao,
      // O mesmo filme pode ser aberto com ?servico=...; para o Google, o endereço "oficial" é sem ele
      alternates: { canonical: `/filme/${filme.id}` },
      openGraph: {
        type: "video.movie",
        title: filme.titulo,
        description: descricao,
        ...(imagem && { images: [{ url: imagem, alt: filme.titulo }] }),
      },
    };
  } catch {
    // Se o TMDB falhar, a página mostra a mensagem de erro; aqui fica o título padrão
    return {};
  }
}

export default function PaginaFilme({ params, searchParams }: PageProps<"/filme/[id]">) {
  return (
    <Suspense
      fallback={
        <div role="status">
          <span className="sr-only">Carregando filme…</span>
          <EsqueletoFilme />
        </div>
      }
    >
      <DetalhesFilme params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function DetalhesFilme({ params, searchParams }: Pick<PageProps<"/filme/[id]">, "params" | "searchParams">) {
  const id = lerId((await params).id);
  if (!id) notFound(); // ex.: /filme/abc
  const filme = await buscarDetalhes(id);
  if (!filme) notFound(); // id que o TMDB não conhece

  const duracao = formatarDuracao(filme.duracaoMin);

  return (
    <article>
      <section className={styles.topo}>
        {filme.fundo && <Image src={filme.fundo} alt="" fill loading="eager" sizes="100vw" className={styles.fundo} />}
        <div className={styles.degrade} />

        <div className={styles.conteudo}>
          {/* O filtro vem do endereço (?servico=...): carrega à parte, para o resto da página continuar pré-montado */}
          <Suspense fallback={<LinkVoltar href="/" />}>
            <VoltarComFiltro searchParams={searchParams} />
          </Suspense>

          <div className={styles.linha}>
            <div className={styles.capa}>
              {filme.capa ? (
                <Image src={filme.capa} alt={`Capa de ${filme.titulo}`} fill loading="eager" fetchPriority="high" sizes="210px" />
              ) : (
                <span className={styles.semCapa}>{filme.titulo}</span>
              )}
            </div>

            <div className={styles.info}>
              <h1>
                {filme.titulo} {filme.ano && <span>({filme.ano})</span>}
              </h1>
              <div className={styles.meta}>
                <span className={styles.nota}>
                  <span aria-hidden="true">⭐ {formatarNota(filme.nota)}</span>
                  <span className="sr-only">Nota {formatarNota(filme.nota)} de 10</span>
                </span>
                {duracao && <span>{duracao}</span>}
                {filme.generos.map((g) => (
                  <span key={g} className={styles.genero}>
                    {g}
                  </span>
                ))}
              </div>
              {filme.sinopse && <p className={styles.sinopse}>{filme.sinopse}</p>}

              <h2 className={styles.rotulo}>Onde assistir no Brasil</h2>
              {filme.ondeAssistir.length > 0 ? (
                <ul className={styles.servicos}>
                  {filme.ondeAssistir.map((p) => (
                    <li key={p.id} className={styles.servico}>
                      {p.logo && <Image src={p.logo} alt="" width={28} height={28} />}
                      {p.nome}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.vazio}>Sem streaming no Brasil no momento.</p>
              )}

              {/* Botões de lista: dependem de quem visita, então carregam depois do resto */}
              <Suspense fallback={null}>
                <AreaPessoalFilme filmeId={filme.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {filme.trailerKey && (
        <section className={styles.bloco}>
          <h2 className={styles.rotulo}>Trailer</h2>
          <Trailer videoKey={filme.trailerKey} titulo={filme.titulo} />
        </section>
      )}

      {filme.elenco.length > 0 && (
        <section className={styles.bloco}>
          <h2 className={styles.rotulo}>Elenco principal</h2>
          <Elenco atores={filme.elenco} />
        </section>
      )}
    </article>
  );
}

/** "← Voltar ao catálogo" levando de volta aos filtros (serviço e gênero) que a pessoa tinha escolhido. */
async function VoltarComFiltro({ searchParams }: Pick<PageProps<"/filme/[id]">, "searchParams">) {
  const { servico, genero } = await searchParams;
  // O gênero só é conferido como número aqui (sem consultar o TMDB); a página inicial valida de verdade
  return <LinkVoltar href={hrefCatalogo(typeof servico === "string" ? servico : undefined, lerIdGenero(genero))} />;
}

function LinkVoltar({ href }: { href: string }) {
  return (
    <Link href={href} className={styles.voltar}>
      ← Voltar ao catálogo
    </Link>
  );
}
