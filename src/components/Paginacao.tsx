import Link from "next/link";
import styles from "@/app/minha-conta/page.module.css";

/** "← Anterior · Página 2 de 5 · Próxima →" para as listas da Minha conta. */
export function Paginacao({ aba, pagina, totalPaginas }: { aba: string; pagina: number; totalPaginas: number }) {
  if (totalPaginas <= 1) return null;
  const href = (n: number) => `/minha-conta?aba=${aba}&pagina=${n}`;
  return (
    <nav aria-label="Páginas da lista" className={styles.paginacao}>
      {pagina > 1 ? <Link href={href(pagina - 1)}>← Anterior</Link> : <span />}
      <span>
        Página {pagina} de {totalPaginas}
      </span>
      {pagina < totalPaginas ? <Link href={href(pagina + 1)}>Próxima →</Link> : <span />}
    </nav>
  );
}
