import { textoSelo } from "@/lib/busca";
import type { FilmeBuscado } from "@/lib/tipos";
import { CartaoFilme } from "./CartaoFilme";
import styles from "./GradeFilmes.module.css";

/** A grade da busca: mesmos cartões do catálogo, com o selo de disponibilidade. */
export function GradeBusca({ filmes }: { filmes: FilmeBuscado[] }) {
  return (
    <div className={styles.grade}>
      {filmes.map((filme, i) => {
        const texto = textoSelo(filme.servicos);
        return (
          <CartaoFilme
            key={filme.id}
            filme={filme}
            prioridade={i === 0 ? "alta" : i < 6 ? "imediata" : "normal"}
            selo={texto ? { texto, disponivel: (filme.servicos?.length ?? 0) > 0 } : undefined}
          />
        );
      })}
    </div>
  );
}
