import styles from "./Esqueleto.module.css";

/** Cartões cinzas pulsando no formato das capas, enquanto os filmes carregam. */
export function EsqueletoGrade({ quantidade }: { quantidade: number }) {
  return (
    <div className={styles.grade} aria-hidden="true">
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i}>
          <div className={`${styles.bloco} ${styles.capa}`} />
          <div className={`${styles.bloco} ${styles.linha}`} />
          <div className={`${styles.bloco} ${styles.linhaCurta}`} />
        </div>
      ))}
    </div>
  );
}

/** Os botões de filtro em versão "esqueleto". */
export function EsqueletoFiltro() {
  return (
    <div className={styles.filtro} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={`${styles.bloco} ${styles.pilula}`} />
      ))}
    </div>
  );
}

/** A página do filme em versão "esqueleto". */
export function EsqueletoFilme() {
  return (
    <div className={styles.filme} aria-hidden="true">
      <div className={`${styles.bloco} ${styles.linhaCurta}`} />
      <div className={styles.filmeLinha}>
        <div className={`${styles.bloco} ${styles.capaFilme}`} />
        <div className={styles.filmeInfo}>
          <div className={`${styles.bloco} ${styles.tituloFilme}`} />
          <div className={`${styles.bloco} ${styles.linha}`} />
          <div className={`${styles.bloco} ${styles.paragrafo}`} />
          <div className={`${styles.bloco} ${styles.paragrafo}`} />
          <div className={`${styles.bloco} ${styles.linhaCurta}`} />
        </div>
      </div>
    </div>
  );
}
