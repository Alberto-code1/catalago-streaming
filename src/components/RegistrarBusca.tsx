"use client"; // roda no navegador, só quando a página de resultados abre de verdade

import { useEffect, useRef } from "react";
import { registrarBuscaAcao } from "@/app/acoes";
import { definirEstado } from "./estadoPessoal";

/**
 * Não mostra nada: guarda a busca em "Buscas recentes" (se a pessoa estiver logada
 * e com o histórico ligado) e atualiza a lista da caixa de busca na hora.
 */
export function RegistrarBusca({ texto }: { texto: string }) {
  const registrado = useRef<string | null>(null);
  useEffect(() => {
    if (registrado.current === texto) return;
    registrado.current = texto;
    registrarBuscaAcao(texto)
      .then((buscas) => {
        if (buscas) definirEstado({ buscas });
      })
      .catch(() => {
        // Se falhar, só não entra no histórico
      });
  }, [texto]);
  return null;
}
