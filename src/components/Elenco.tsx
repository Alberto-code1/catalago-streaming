import Image from "next/image";
import { iniciais } from "@/lib/formatar";
import type { Ator } from "@/lib/tipos";
import styles from "./Elenco.module.css";

/** Fila de atores com foto (ou iniciais), nome e personagem. Rola para o lado. */
export function Elenco({ atores }: { atores: Ator[] }) {
  return (
    <ul className={styles.fila}>
      {atores.map((ator) => (
        <li key={`${ator.id}-${ator.personagem}`} className={styles.ator}>
          <div className={styles.foto}>
            {ator.foto ? (
              <Image src={ator.foto} alt={ator.nome} fill sizes="96px" />
            ) : (
              <span aria-hidden="true">{iniciais(ator.nome)}</span>
            )}
          </div>
          <p className={styles.nome}>{ator.nome}</p>
          {ator.personagem && <p className={styles.personagem}>{ator.personagem}</p>}
        </li>
      ))}
    </ul>
  );
}
