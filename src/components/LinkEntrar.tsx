"use client"; // lê o endereço atual no navegador, para voltar a ele depois do login

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./AreaConta.module.css";

/** O link "Entrar". Depois do login, a pessoa volta para a página onde estava. */
export function LinkEntrar() {
  const caminho = usePathname();
  const params = useSearchParams().toString();
  const atual = params ? `${caminho}?${params}` : caminho;
  const href = caminho === "/entrar" || atual === "/" ? "/entrar" : `/entrar?volta=${encodeURIComponent(atual)}`;
  return (
    <Link href={href} className={styles.entrar}>
      Entrar
    </Link>
  );
}
