import styles from "./Trailer.module.css";

type Props = { videoKey: string; titulo: string };

/** O trailer do YouTube embutido na página (versão "nocookie", mais respeitosa com a privacidade). */
export function Trailer({ videoKey, titulo }: Props) {
  return (
    <div className={styles.moldura}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoKey}`}
        title={`Trailer de ${titulo}`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
