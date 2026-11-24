"use client"; // a chave e os botões respondem no navegador e gravam no servidor

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { apagarHistoricoAcao, definirHistoricoAcao } from "@/app/acoes";
import { ConfirmarExclusao } from "./ConfirmarExclusao";
import { definirEstado } from "./estadoPessoal";
import styles from "./PrivacidadeDados.module.css";

/** A seção "Privacidade e dados" da Minha conta (direitos da LGPD). */
export function PrivacidadeDados({ historico }: { historico: boolean }) {
  const [ligado, setLigado] = useState(historico);
  const [naTela, mostrar] = useOptimistic(ligado);
  const [, iniciar] = useTransition();
  const [aviso, setAviso] = useState("");

  function alternarHistorico() {
    const novo = !naTela;
    setAviso("");
    iniciar(async () => {
      mostrar(novo);
      const r = await definirHistoricoAcao(novo);
      if (r.ok) {
        setLigado(novo);
        if (!novo) definirEstado({ buscas: [], historico: false });
        else definirEstado({ historico: true });
        setAviso(novo ? "Histórico ligado." : "Histórico desligado e apagado.");
      } else {
        setAviso("Não foi possível mudar agora. Tente de novo.");
      }
    });
  }

  function apagar() {
    setAviso("");
    iniciar(async () => {
      const r = await apagarHistoricoAcao();
      if (r.ok) definirEstado({ buscas: [] });
      setAviso(r.ok ? "Histórico apagado." : "Não foi possível apagar agora. Tente de novo.");
    });
  }

  return (
    <section className={styles.secao} aria-labelledby="titulo-privacidade">
      <h2 id="titulo-privacidade">Privacidade e dados</h2>

      <div className={styles.linha}>
        <button type="button" role="switch" aria-checked={naTela} onClick={alternarHistorico} className={styles.chave}>
          <span className={styles.trilho} aria-hidden="true">
            <span className={styles.bolinha} />
          </span>
          Guardar meu histórico
        </button>
        <p className={styles.explica}>
          Vistos recentemente e buscas recentes. Ao desligar, seus vistos recentemente e buscas recentes são apagados.
        </p>
      </div>

      <div className={styles.botoes}>
        <button type="button" onClick={apagar} className={styles.botao}>
          Apagar histórico
        </button>
        <a href="/api/eu/dados" download className={styles.botao}>
          Baixar meus dados
        </a>
        <ConfirmarExclusao />
      </div>

      <p role="status" className={styles.aviso}>
        {aviso}
      </p>
      <p className={styles.explica}>
        Saiba o que guardamos e por quê na <Link href="/privacidade">política de privacidade</Link>.
      </p>
    </section>
  );
}
