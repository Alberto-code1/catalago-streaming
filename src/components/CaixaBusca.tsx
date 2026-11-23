"use client"; // lê o endereço no navegador para mostrar o texto buscado

import { usePathname, useSearchParams } from "next/navigation";
import styles from "./CaixaBusca.module.css";

/**
 * O campo de busca. É um formulário comum: ao apertar Enter, o navegador
 * vai para /busca?q=<texto> sozinho, sem JavaScript.
 */
export function CampoBusca({ valorInicial = "" }: { valorInicial?: string }) {
  return (
    <form action="/busca" method="get" role="search" className={styles.form}>
      <input
        // key: ao fazer outra busca, o campo mostra o texto novo
        key={valorInicial}
        type="search"
        name="q"
        defaultValue={valorInicial}
        aria-label="Buscar filme"
        placeholder="🔍 Buscar filme…"
        maxLength={100}
        className={styles.campo}
      />
    </form>
  );
}

/** O campo de busca, já preenchido com o texto quando estamos na página de resultados. */
export function CaixaBusca() {
  const caminho = usePathname();
  const params = useSearchParams();
  const valor = caminho === "/busca" ? (params.get("q") ?? "") : "";
  return <CampoBusca valorInicial={valor} />;
}
