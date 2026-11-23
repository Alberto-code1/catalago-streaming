"use client"; // os botões respondem na hora, no navegador, e gravam no servidor

import { useOptimistic, useState, useTransition } from "react";
import { alternarQuero, type Resultado } from "@/app/acoes";
import type { Nota } from "@/lib/listas";
import styles from "./BotoesLista.module.css";

export type EstadoFilme = { quero: boolean; assistido: boolean; nota: Nota };

/** O texto do aviso quando uma ação não dá certo. */
function mensagem(motivo: Exclude<Resultado, { ok: true }>["motivo"]): string {
  if (motivo === "limite") return "Sua lista chegou ao limite de 500 filmes.";
  if (motivo === "sem-login") return "Sua sessão expirou. Entre de novo para salvar.";
  return "Não foi possível salvar agora. Tente de novo.";
}

/** Os botões de lista da página do filme, para quem está logado. */
export function BotoesLista({ filmeId, inicial }: { filmeId: number; inicial: EstadoFilme }) {
  const [quero, setQuero] = useState(inicial.quero);
  // Mostra a mudança na hora; se o servidor recusar, volta sozinho ao valor salvo
  const [queroNaTela, mostrarQuero] = useOptimistic(quero);
  const [, iniciar] = useTransition();
  const [aviso, setAviso] = useState("");

  function alternarListaQuero() {
    const novo = !queroNaTela;
    setAviso("");
    iniciar(async () => {
      mostrarQuero(novo);
      const r = await alternarQuero(filmeId, novo);
      if (r.ok) setQuero(novo);
      else setAviso(mensagem(r.motivo));
    });
  }

  return (
    <div className={styles.area}>
      <div className={styles.botoes}>
        <button
          type="button"
          aria-pressed={queroNaTela}
          onClick={alternarListaQuero}
          className={queroNaTela ? `${styles.botao} ${styles.ativo}` : styles.botao}
        >
          {queroNaTela ? "✓ Na sua lista" : "+ Quero assistir"}
        </button>
      </div>
      <p role="status" className={styles.aviso}>
        {aviso}
      </p>
    </div>
  );
}
