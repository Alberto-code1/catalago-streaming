import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Elenco } from "@/components/Elenco";
import { Trailer } from "@/components/Trailer";
import { formatarDuracao, formatarNota } from "@/lib/formatar";
import { buscarDetalhes, buscarFilmes } from "@/lib/tmdb";
import styles from "./page.module.css";

/** Na publicação, já deixa prontas as páginas dos 20 filmes mais populares. */
export async function generateStaticParams() {
  const { filmes } = await buscarFilmes(undefined, 1);
  return filmes.map((f) => ({ id: String(f.id) }));
}

/** Transforma o texto do endereço num id válido (número inteiro positivo), ou null. */
function lerId(texto: string): number | null {
  return /^[1-9]\d*$/.test(texto) ? Number(texto) : null;
}

export async function generateMetadata({ params }: PageProps<"/filme/[id]">): Promise<Metadata> {
  const id = lerId((await params).id);
  const filme = id ? await buscarDetalhes(id) : null;
  return { title: filme ? `${filme.titulo} · Catálogo Streaming` : "Filme não encontrado · Catálogo Streaming" };
}

export default function PaginaFilme({ params }: PageProps<"/filme/[id]">) {
  return (
    <Suspense fallback={<p className={styles.carregando}>Carregando filme…</p>}>
      <DetalhesFilme params={params} />
    </Suspense>
  );
}

async function DetalhesFilme({ params }: Pick<PageProps<"/filme/[id]">, "params">) {
  const id = lerId((await params).id);
  if (!id) notFound(); // ex.: /filme/abc
  const filme = await buscarDetalhes(id);
  if (!filme) notFound(); // id que o TMDB não conhece

  const duracao = formatarDuracao(filme.duracaoMin);

  return (
    <article>
      <section className={styles.topo}>
        {filme.fundo && <Image src={filme.fundo} alt="" fill priority sizes="100vw" className={styles.fundo} />}
        <div className={styles.degrade} />

        <div className={styles.conteudo}>
          <Link href="/" className={styles.voltar}>
            ← Voltar ao catálogo
          </Link>

          <div className={styles.linha}>
            <div className={styles.capa}>
              {filme.capa ? (
                <Image src={filme.capa} alt={`Capa de ${filme.titulo}`} fill priority sizes="210px" />
              ) : (
                <span className={styles.semCapa}>{filme.titulo}</span>
              )}
            </div>

            <div className={styles.info}>
              <h1>
                {filme.titulo} {filme.ano && <span>({filme.ano})</span>}
              </h1>
              <div className={styles.meta}>
                <span className={styles.nota}>⭐ {formatarNota(filme.nota)}</span>
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
