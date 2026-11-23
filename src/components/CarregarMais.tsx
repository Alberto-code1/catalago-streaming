"use client"; // roda no navegador: reage ao clique do visitante

import { useState } from "react";
import { juntarSemRepetir } from "@/lib/discover";
import { servicoPorSlug } from "@/lib/servicos";
import type { FilmeResumo, PaginaFilmes } from "@/lib/tipos";
import { GradeFilmes } from "./GradeFilmes";
import styles from "./CarregarMais.module.css";

type Props = {
  /** Apelido do serviço filtrado (ou nada, para "Todos"). */
  servico?: string;
  /** A página que já veio do servidor (normalmente 1). */
  paginaInicial: number;
  totalPaginas: number;
  /** Os filmes que já estão na tela, para não repetir. */
  idsIniciais: number[];
};

/** O botão "Carregar mais filmes" e os filmes que ele vai acrescentando. */
export function CarregarMais({ servico, paginaInicial, totalPaginas, idsIniciais }: Props) {
  const [extras, setExtras] = useState<FilmeResumo[]>([]);
  const [pagina, setPagina] = useState(paginaInicial);
  const [total, setTotal] = useState(totalPaginas);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const params = new URLSearchParams({ pagina: String(pagina + 1) });
      if (servico) params.set("servico", servico);
      const resposta = await fetch(`/api/filmes?${params}`);
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);

      const { filmes, pagina: nova, totalPaginas: novoTotal } = dados as PaginaFilmes;
      const naTela = new Set(idsIniciais);
      setExtras((atuais) => juntarSemRepetir(atuais, filmes.filter((f) => !naTela.has(f.id))));
      setPagina(nova);
      setTotal(novoTotal);
    } catch (e) {
      setErro(e instanceof Error && e.message ? e.message : "Não foi possível carregar os filmes agora. Tente de novo em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <div aria-live="polite">
        {extras.length > 0 && <GradeFilmes filmes={extras} servico={servicoPorSlug(servico)} />}
      </div>
      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}
      {pagina < total && (
        <button type="button" className={styles.botao} onClick={carregar} disabled={carregando} aria-busy={carregando}>
          {carregando ? "Carregando…" : "Carregar mais filmes"}
        </button>
      )}
    </>
  );
}
