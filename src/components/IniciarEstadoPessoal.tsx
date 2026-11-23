"use client"; // roda no navegador: guarda os dados da pessoa para os outros componentes

import { useEffect } from "react";
import { definirEstado } from "./estadoPessoal";

type Props = { historico: boolean; assistidos?: number[]; buscas?: string[] };

/** Não mostra nada: só preenche o estado pessoal quando a pessoa está logada. */
export function IniciarEstadoPessoal({ historico, assistidos = [], buscas = [] }: Props) {
  // Uma "chave" de texto evita refazer o trabalho quando nada mudou
  const chave = JSON.stringify([historico, assistidos, buscas]);
  useEffect(() => {
    const [h, a, b] = JSON.parse(chave) as [boolean, number[], string[]];
    definirEstado({ logado: true, historico: h, assistidos: new Set(a), buscas: b });
  }, [chave]);
  return null;
}
