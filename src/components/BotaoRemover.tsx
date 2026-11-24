"use client"; // o clique grava no servidor e atualiza a lista

import { useState, useTransition } from "react";
import { removerDaLista } from "@/app/acoes";
import type { Aba } from "@/lib/listas";
import styles from "./ItemLista.module.css";

/** O botão "Remover" de um filme numa lista da Minha conta. */
export function BotaoRemover({ lista, filmeId, titulo }: { lista: Aba; filmeId: number; titulo: string }) {
  const [removendo, iniciar] = useTransition();
  const [erro, setErro] = useState(false);

  function remover() {
    setErro(false);
    iniciar(async () => {
      const r = await removerDaLista(lista, filmeId);
      if (!r.ok) setErro(true);
    });
  }

  return (
    <>
      <button type="button" onClick={remover} disabled={removendo} className={styles.remover} aria-label={`Remover ${titulo}`}>
        {removendo ? "Removendo…" : "Remover"}
      </button>
      {erro && (
        <p role="status" className={styles.erro}>
          Não foi possível remover agora.
        </p>
      )}
    </>
  );
}
