import type { FilmeResumo, Servico } from "@/lib/tipos";
import { CartaoFilme } from "./CartaoFilme";
import styles from "./GradeFilmes.module.css";

type Props = {
  filmes: FilmeResumo[];
  servico?: Servico;
  /** Gênero filtrado: os cartões o levam para a página do filme (para o "Voltar"). */
  genero?: number;
  /** Quantas capas do começo carregam já, sem esperar (as que aparecem sem rolar). */
  capasImediatas?: number;
};

/** A grade de cartões de filmes. Se ajusta sozinha à largura da tela. */
export function GradeFilmes({ filmes, servico, genero, capasImediatas = 0 }: Props) {
  return (
    <div className={styles.grade}>
      {filmes.map((filme, i) => (
        <CartaoFilme
          key={filme.id}
          filme={filme}
          servico={servico}
          genero={genero}
          // A 1ª capa costuma ser a maior imagem visível (o "LCP"): vai com prioridade alta
          prioridade={i === 0 && capasImediatas > 0 ? "alta" : i < capasImediatas ? "imediata" : "normal"}
        />
      ))}
    </div>
  );
}
