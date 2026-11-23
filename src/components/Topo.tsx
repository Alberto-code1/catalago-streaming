import Link from "next/link";
import { Suspense } from "react";
import { CaixaBusca, CampoBusca } from "./CaixaBusca";
import styles from "./Topo.module.css";

/** A barra do topo: nome do site, busca e o link "Sobre". */
export function Topo() {
  return (
    <header className={styles.topo}>
      <div className={styles.dentro}>
        <Link href="/" className={styles.logo}>
          <span aria-hidden="true">🎬 </span>Catálogo<span className={styles.destaque}>Streaming</span>
        </Link>
        {/* A caixa lê o endereço no navegador, por isso fica num Suspense (com uma caixa vazia enquanto isso) */}
        <Suspense fallback={<CampoBusca />}>
          <CaixaBusca />
        </Suspense>
        <nav aria-label="Principal" className={styles.menu}>
          <Link href="/sobre">Sobre</Link>
        </nav>
      </div>
    </header>
  );
}
