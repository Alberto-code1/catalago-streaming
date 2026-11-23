import Link from "next/link";
import { hrefCatalogo } from "@/lib/links";
import type { Genero } from "@/lib/tipos";
import styles from "./FiltroGenero.module.css";
import { MenuFechavel } from "./MenuFechavel";

type Props = {
  generos: Genero[];
  /** Id do gênero escolhido (ou nada, para "Todos os gêneros"). */
  ativo?: number;
  /** Serviço escolhido, para o link do gênero não apagá-lo. */
  servico?: string;
};

/**
 * O botão "Gênero ▾". É um <details>: abre e fecha sem JavaScript
 * (e, com JavaScript, também fecha com Esc ou clique fora).
 * Cada gênero é um link (como os botões de serviço), então o filtro fica no endereço.
 */
export function FiltroGenero({ generos, ativo, servico }: Props) {
  const atual = generos.find((g) => g.id === ativo);
  const opcoes = [{ id: undefined, nome: "Todos os gêneros" }, ...generos];

  return (
    // key: ao trocar de filtro, o menu volta fechado
    <MenuFechavel key={`${servico ?? "todos"}-${ativo ?? "todos"}`} className={styles.menu}>
      <summary className={atual ? `${styles.botao} ${styles.ativo}` : styles.botao}>
        {atual ? `Gênero: ${atual.nome}` : "Gênero"} <span aria-hidden="true">▾</span>
      </summary>
      <ul className={styles.lista}>
        {opcoes.map((g) => {
          const selecionado = g.id === ativo;
          return (
            <li key={g.nome}>
              <Link
                href={hrefCatalogo(servico, g.id)}
                className={selecionado ? `${styles.opcao} ${styles.selecionada}` : styles.opcao}
                // "true" (e não "page"): a página atual já é marcada pelo botão de serviço
                aria-current={selecionado ? "true" : undefined}
              >
                {g.nome}
              </Link>
            </li>
          );
        })}
      </ul>
    </MenuFechavel>
  );
}
