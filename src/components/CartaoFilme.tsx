import Image from "next/image";
import Link from "next/link";
import { formatarNota } from "@/lib/formatar";
import { hrefFilme } from "@/lib/links";
import type { FilmeResumo, Servico } from "@/lib/tipos";
import styles from "./CartaoFilme.module.css";

type Props = {
  filme: FilmeResumo;
  /** Quando um serviço está filtrado, o cartão mostra o selo dele. */
  servico?: Servico;
  /** Gênero filtrado: vai junto no link, para o "Voltar" lembrar dele. */
  genero?: number;
  /**
   * Para as capas que aparecem logo no topo da tela: carrega já ("eager"),
   * em vez de esperar o visitante rolar ("lazy", o padrão). "alta" também
   * pede ao navegador para buscar essa imagem antes das outras.
   */
  prioridade?: "normal" | "imediata" | "alta";
};

/** O cartão de um filme na grade: capa, nota, título e ano. Clicar abre a página do filme. */
export function CartaoFilme({ filme, servico, genero, prioridade = "normal" }: Props) {
  return (
    <Link href={hrefFilme(filme.id, servico?.slug, genero)} className={styles.cartao} data-testid="cartao-filme">
      <div className={styles.capa}>
        {filme.capa ? (
          <Image
            src={filme.capa}
            alt={`Capa de ${filme.titulo}`}
            fill
            sizes="(max-width: 600px) 45vw, 180px"
            loading={prioridade === "normal" ? "lazy" : "eager"}
            fetchPriority={prioridade === "alta" ? "high" : undefined}
          />
        ) : (
          <span className={styles.semCapa}>{filme.titulo}</span>
        )}
        <span className={styles.nota}>
          <span aria-hidden="true">⭐ {formatarNota(filme.nota)}</span>
          <span className="sr-only">Nota {formatarNota(filme.nota)} de 10</span>
        </span>
        {servico && (
          <span className={styles.selo} style={{ background: servico.cor }}>
            {servico.nome}
          </span>
        )}
      </div>
      <h2 className={styles.titulo}>{filme.titulo}</h2>
      <p className={styles.ano}>{filme.ano}</p>
    </Link>
  );
}
