"use client"; // abre a caixa de confirmação e exclui a conta pelo servidor

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { excluirContaAcao } from "@/app/acoes";
import { definirEstado, ESTADO_VAZIO } from "./estadoPessoal";
import styles from "./PrivacidadeDados.module.css";

/**
 * "Excluir minha conta" com confirmação numa caixa da própria página (<dialog>):
 * ela prende o foco enquanto está aberta e fecha com Esc.
 */
export function ConfirmarExclusao() {
  const router = useRouter();
  const caixa = useRef<HTMLDialogElement>(null);
  const [excluindo, iniciar] = useTransition();
  const [erro, setErro] = useState(false);

  function excluir() {
    setErro(false);
    iniciar(async () => {
      const r = await excluirContaAcao();
      if (r.ok) {
        // Esquece os dados da pessoa no navegador e volta ao início, já sem login
        definirEstado(ESTADO_VAZIO);
        caixa.current?.close();
        router.push("/");
        router.refresh();
      } else {
        setErro(true);
      }
    });
  }

  return (
    <>
      <button type="button" onClick={() => caixa.current?.showModal()} className={`${styles.botao} ${styles.perigo}`}>
        Excluir minha conta
      </button>
      <dialog ref={caixa} className={styles.caixa} aria-labelledby="titulo-excluir">
        <h2 id="titulo-excluir">Excluir minha conta?</h2>
        <p>Isso apaga sua conta, suas listas e seu histórico. Não dá para desfazer.</p>
        {erro && (
          <p role="alert" className={styles.aviso}>
            Não foi possível excluir agora. Tente de novo.
          </p>
        )}
        <div className={styles.botoes}>
          <button type="button" onClick={() => caixa.current?.close()} className={styles.botao} autoFocus>
            Cancelar
          </button>
          <button type="button" onClick={excluir} disabled={excluindo} className={`${styles.botao} ${styles.perigoCheio}`}>
            {excluindo ? "Excluindo…" : "Excluir para sempre"}
          </button>
        </div>
      </dialog>
    </>
  );
}
