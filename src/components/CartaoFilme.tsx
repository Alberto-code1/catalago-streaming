import Image from "next/image";
import Link from "next/link";
import { formatarNota } from "@/lib/formatar";
import type { FilmeResumo, Servico } from "@/lib/tipos";
import styles from "./CartaoFilme.module.css";

type Props = {
  filme: FilmeResumo;
  /** Quando um serviço está filtrado, o cartão mostra o selo dele. */
  servico?: Servico;
};

/** O cartão de um filme na grade: capa, nota, título e ano. Clicar abre a página do filme. */
export function CartaoFilme({ filme, servico }: Props) {
  return (
    <Link href={`/filme/${filme.id}`} className={styles.cartao} data-testid="cartao-filme">
      <div className={styles.capa}>
        {filme.capa ? (
          <Image
            src={filme.capa}
            alt={`Capa de ${filme.titulo}`}
            fill
            sizes="(max-width: 600px) 45vw, 180px"
          />
        ) : (
          <span className={styles.semCapa}>{filme.titulo}</span>
        )}
        <span className={styles.nota}>⭐ {formatarNota(filme.nota)}</span>
        {servico && (
          <span className={styles.selo} style={{ background: servico.cor }}>
            {servico.nome}
          </span>
        )}
      </div>
      <h3 className={styles.titulo}>{filme.titulo}</h3>
      <p className={styles.ano}>{filme.ano}</p>
    </Link>
  );
}
