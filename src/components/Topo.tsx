import Link from "next/link";
import styles from "./Topo.module.css";

/** A barra do topo, com o nome do site e o link "Sobre". */
export function Topo() {
  return (
    <header className={styles.topo}>
      <div className={styles.dentro}>
        <Link href="/" className={styles.logo}>
          <span aria-hidden="true">🎬 </span>Catálogo<span className={styles.destaque}>Streaming</span>
        </Link>
        <nav aria-label="Principal" className={styles.menu}>
          <Link href="/sobre">Sobre</Link>
        </nav>
      </div>
    </header>
  );
}
