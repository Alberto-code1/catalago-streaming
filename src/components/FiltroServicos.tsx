import Link from "next/link";
import { SERVICOS } from "@/lib/servicos";
import styles from "./FiltroServicos.module.css";

type Props = {
  /** Apelido do serviço escolhido (ex.: "netflix"). Sem valor = "Todos". */
  ativo?: string;
};

/**
 * Os botões de filtro. São links (e não botões), para o filtro ficar no
 * endereço da página: dá para compartilhar o link e o "Voltar" funciona.
 */
export function FiltroServicos({ ativo }: Props) {
  const opcoes = [{ slug: undefined, nome: "Todos", href: "/" }, ...SERVICOS.map((s) => ({ ...s, href: `/?servico=${s.slug}` }))];

  return (
    <nav className={styles.filtro} aria-label="Filtrar por serviço de streaming">
      {opcoes.map((opcao) => {
        const selecionado = opcao.slug === ativo;
        return (
          <Link
            key={opcao.nome}
            href={opcao.href}
            className={selecionado ? `${styles.pilula} ${styles.ativa}` : styles.pilula}
            aria-current={selecionado ? "page" : undefined}
          >
            {opcao.nome}
          </Link>
        );
      })}
    </nav>
  );
}
