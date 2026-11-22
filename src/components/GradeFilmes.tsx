import type { FilmeResumo, Servico } from "@/lib/tipos";
import { CartaoFilme } from "./CartaoFilme";
import styles from "./GradeFilmes.module.css";

type Props = { filmes: FilmeResumo[]; servico?: Servico };

/** A grade de cartões de filmes. Se ajusta sozinha à largura da tela. */
export function GradeFilmes({ filmes, servico }: Props) {
  return (
    <div className={styles.grade}>
      {filmes.map((filme) => (
        <CartaoFilme key={filme.id} filme={filme} servico={servico} />
      ))}
    </div>
  );
}
