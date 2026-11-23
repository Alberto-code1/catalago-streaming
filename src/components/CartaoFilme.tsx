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
  /** Na busca: selo de disponibilidade abaixo do ano ("✓ Netflix" ou "Indisponível"). */
  selo?: { texto: string; disponivel: boolean };
};

/** O cartão de um filme na grade: capa, nota, título e ano. Clicar abre a página do filme. */
export function CartaoFilme({ filme, servico, genero, prioridade = "normal", selo }: Props) {
  return (
    <Link href={hrefFilme(filme.id, servico?.slug, genero)} className={styles.cartao} data-testid="cartao-filme">
      <div className={selo && !selo.disponivel ? `${styles.capa} ${styles.apagada}` : styles.capa}>
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
      {selo && (
        <span className={selo.disponivel ? styles.disponivel : styles.indisponivel} data-testid="selo">
          {selo.texto}
        </span>
      )}
    </Link>
  );
}
