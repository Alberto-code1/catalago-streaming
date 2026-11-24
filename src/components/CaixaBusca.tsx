"use client"; // lê o endereço no navegador e mostra as buscas recentes

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apagarBuscaAcao } from "@/app/acoes";
import { normalizarBusca } from "@/lib/busca";
import styles from "./CaixaBusca.module.css";
import { definirEstado, useEstadoPessoal } from "./estadoPessoal";

/**
 * O campo de busca. É um formulário comum: ao apertar Enter, o navegador
 * vai para /busca?q=<texto> sozinho, sem JavaScript.
 * Para quem está logado, focar o campo mostra as últimas buscas.
 */
export function CampoBusca({ valorInicial = "" }: { valorInicial?: string }) {
  const { logado, buscas } = useEstadoPessoal();
  const [aberto, setAberto] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const mostrar = aberto && logado && buscas.length > 0;

  // Se a pessoa clicou na caixa antes de a página terminar de carregar, abre a lista assim que der
  useEffect(() => {
    if (document.activeElement === campo.current) setAberto(true);
  }, []);

  // Fecha com um clique fora da caixa
  useEffect(() => {
    if (!mostrar) return;
    function aoClicar(e: PointerEvent) {
      if (!area.current?.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("pointerdown", aoClicar);
    return () => document.removeEventListener("pointerdown", aoClicar);
  }, [mostrar]);

  async function apagar(texto: string | null) {
    const novas = await apagarBuscaAcao(texto);
    if (novas) definirEstado({ buscas: novas });
    campo.current?.focus();
  }

  return (
    <div
      ref={area}
      className={styles.area}
      onKeyDown={(e) => {
        // Esc fecha a lista e devolve o foco ao campo
        if (e.key === "Escape" && mostrar) {
          setAberto(false);
          campo.current?.focus();
        }
      }}
      onBlur={(e) => {
        // Sair da caixa com Tab também fecha
        if (!area.current?.contains(e.relatedTarget as Node | null)) setAberto(false);
      }}
    >
      <form action="/busca" method="get" role="search" className={styles.form}>
        <input
          ref={campo}
          // key: ao fazer outra busca, o campo mostra o texto novo
          key={valorInicial}
          type="search"
          name="q"
          defaultValue={valorInicial}
          aria-label="Buscar filme"
          placeholder="🔍 Buscar filme…"
          maxLength={100}
          className={styles.campo}
          onFocus={() => setAberto(true)}
          // Clicar de novo (por ex. depois de fechar com Esc) também abre a lista
          onClick={() => setAberto(true)}
          // Começou a digitar: a lista sai da frente
          onInput={() => setAberto(false)}
        />
      </form>
      {mostrar && (
        <div className={styles.recentes} role="region" aria-label="Buscas recentes">
          <p className={styles.tituloRecentes}>Buscas recentes</p>
          <ul>
            {buscas.map((texto) => (
              <li key={texto}>
                <Link href={`/busca?q=${encodeURIComponent(texto)}`} onClick={() => setAberto(false)}>
                  {texto}
                </Link>
                <button type="button" aria-label={`Apagar busca ${texto}`} onClick={() => apagar(texto)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.apagarTodas} onClick={() => apagar(null)}>
            Apagar todas
          </button>
        </div>
      )}
    </div>
  );
}

/** O campo de busca, já preenchido com o texto quando estamos na página de resultados. */
export function CaixaBusca() {
  const caminho = usePathname();
  const params = useSearchParams();
  // Mesmo texto limpo que aparece no título da página de resultados
  const valor = caminho === "/busca" ? (normalizarBusca(params.get("q")) ?? "") : "";
  return <CampoBusca valorInicial={valor} />;
}
