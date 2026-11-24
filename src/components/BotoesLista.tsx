"use client"; // os botões respondem na hora, no navegador, e gravam no servidor

import { useOptimistic, useState, useTransition } from "react";
import { alternarAssistido, alternarQuero, definirNota, type Resultado } from "@/app/acoes";
import type { Nota } from "@/lib/listas";
import styles from "./BotoesLista.module.css";
import { definirEstado, useEstadoPessoal } from "./estadoPessoal";

export type EstadoFilme = { quero: boolean; assistido: boolean; nota: Nota };

/** O texto do aviso quando uma ação não dá certo. */
function mensagem(motivo: Exclude<Resultado, { ok: true }>["motivo"]): string {
  if (motivo === "limite") return "Sua lista chegou ao limite.";
  if (motivo === "sem-login") return "Sua sessão expirou. Entre de novo para salvar.";
  return "Não foi possível salvar agora. Tente de novo.";
}

/** Os botões de lista da página do filme, para quem está logado. */
export function BotoesLista({ filmeId, inicial }: { filmeId: number; inicial: EstadoFilme }) {
  const [salvo, setSalvo] = useState(inicial);
  // Mostra a mudança na hora; se o servidor recusar, volta sozinho ao que está salvo
  const [naTela, mostrar] = useOptimistic(salvo, (atual: EstadoFilme, mudanca: Partial<EstadoFilme>) => ({
    ...atual,
    ...mudanca,
  }));
  const [, iniciar] = useTransition();
  const [aviso, setAviso] = useState("");
  const { assistidos } = useEstadoPessoal();

  /** Mostra a mudança, grava no servidor e, se der certo, guarda como salva. */
  function aplicar(mudanca: Partial<EstadoFilme>, gravar: () => Promise<Resultado>, depois?: () => void) {
    setAviso("");
    iniciar(async () => {
      mostrar(mudanca);
      const r = await gravar();
      if (r.ok) {
        setSalvo((atual) => ({ ...atual, ...mudanca }));
        depois?.();
      } else {
        setAviso(mensagem(r.motivo));
      }
    });
  }

  function alternarListaQuero() {
    const quero = !naTela.quero;
    aplicar({ quero }, () => alternarQuero(filmeId, quero));
  }

  function alternarJaAssisti() {
    const assistido = !naTela.assistido;
    // Marcar tira de "Quero assistir"; desmarcar apaga a nota
    const mudanca = assistido ? { assistido, quero: false } : { assistido, nota: null };
    aplicar(mudanca, () => alternarAssistido(filmeId, assistido), () => {
      // Atualiza a marquinha "✓ visto" dos cartões sem recarregar a página
      const novos = new Set(assistidos);
      if (assistido) novos.add(filmeId);
      else novos.delete(filmeId);
      definirEstado({ assistidos: novos });
    });
  }

  function escolherNota(escolhida: Exclude<Nota, null>) {
    // Clicar de novo na nota já escolhida tira a nota
    const nota = naTela.nota === escolhida ? null : escolhida;
    aplicar({ nota }, () => definirNota(filmeId, nota));
  }

  return (
    <div className={styles.area}>
      <div className={styles.botoes}>
        {!naTela.assistido && (
          <button
            type="button"
            aria-pressed={naTela.quero}
            onClick={alternarListaQuero}
            className={naTela.quero ? `${styles.botao} ${styles.ativo}` : styles.botao}
          >
            {naTela.quero ? "✓ Na sua lista" : "+ Quero assistir"}
          </button>
        )}
        <button
          type="button"
          aria-pressed={naTela.assistido}
          onClick={alternarJaAssisti}
          className={naTela.assistido ? `${styles.botao} ${styles.ativo}` : styles.botao}
        >
          {naTela.assistido ? "✓ Assistido" : "Já assisti"}
        </button>
        {naTela.assistido && (
          <>
            <button
              type="button"
              aria-pressed={naTela.nota === "gostei"}
              aria-label="Gostei"
              onClick={() => escolherNota("gostei")}
              className={`${styles.botao} ${styles.nota} ${naTela.nota === "gostei" ? styles.ativo : ""}`}
            >
              👍
            </button>
            <button
              type="button"
              aria-pressed={naTela.nota === "nao_gostei"}
              aria-label="Não gostei"
              onClick={() => escolherNota("nao_gostei")}
              className={`${styles.botao} ${styles.nota} ${naTela.nota === "nao_gostei" ? styles.ativo : ""}`}
            >
              👎
            </button>
          </>
        )}
      </div>
      <p role="status" className={styles.aviso}>
        {aviso}
      </p>
    </div>
  );
}
