import Link from "next/link";
import styles from "./Topo.module.css";

/** A barra do topo, com o nome do site. */
export function Topo() {
  return (
    <header className={styles.topo}>
      <div className={styles.dentro}>
        <Link href="/" className={styles.logo}>
          🎬 Catálogo<span>Streaming</span>
        </Link>
      </div>
    </header>
  );
}
