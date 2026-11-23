import Link from "next/link";
import type { ReactNode } from "react";
import { hrefCatalogo } from "@/lib/links";
import { SERVICOS } from "@/lib/servicos";
import styles from "./FiltroServicos.module.css";

type Props = {
  /** Apelido do serviço escolhido (ex.: "netflix"). Sem valor = "Todos". */
  ativo?: string;
  /** Gênero escolhido: os links de serviço o mantêm. */
  genero?: number;
  /** Outros filtros na mesma linha (ex.: o botão de gênero). */
  children?: ReactNode;
};

/**
 * Os botões de filtro. São links (e não botões), para o filtro ficar no
 * endereço da página: dá para compartilhar o link e o "Voltar" funciona.
 */
export function FiltroServicos({ ativo, genero, children }: Props) {
  const opcoes = [{ slug: undefined, nome: "Todos" }, ...SERVICOS];

  return (
    <nav className={styles.filtro} aria-label="Filtros do catálogo">
      {opcoes.map((opcao) => {
        const selecionado = opcao.slug === ativo;
        return (
          <Link
            key={opcao.nome}
            href={hrefCatalogo(opcao.slug, genero)}
            className={selecionado ? `${styles.pilula} ${styles.ativa}` : styles.pilula}
            aria-current={selecionado ? "page" : undefined}
          >
            {opcao.nome}
          </Link>
        );
      })}
      {children}
    </nav>
  );
}
