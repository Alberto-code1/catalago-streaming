"use client"; // roda no navegador, só quando a página do filme abre de verdade

import { useEffect, useRef } from "react";
import { registrarVisitaAcao } from "@/app/acoes";

/**
 * Não mostra nada: avisa o servidor que a pessoa abriu este filme ("Vistos recentemente").
 * Fica no navegador (e não no servidor) para não contar visitas quando o site
 * apenas pré-carrega a página em segundo plano.
 */
export function RegistrarVisita({ filmeId }: { filmeId: number }) {
  // Garante um registro só por filme aberto (no modo de desenvolvimento, o React roda os efeitos duas vezes)
  const registrado = useRef<number | null>(null);
  useEffect(() => {
    if (registrado.current === filmeId) return;
    registrado.current = filmeId;
    registrarVisitaAcao(filmeId).catch(() => {
      // Se falhar, só não entra no histórico: não atrapalha a página
    });
  }, [filmeId]);
  return null;
}
