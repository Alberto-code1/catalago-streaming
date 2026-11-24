import "server-only";
import { and, desc, eq, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { buscasRecentes, vistosRecentes } from "@/db/schema";
import { chaveBusca, LIMITES } from "../listas";

// O histórico da pessoa: filmes abertos e buscas feitas.
// Quem chama já conferiu a sessão e se o histórico está ligado.

/**
 * Guarda que a pessoa abriu o filme agora. Abrir de novo só atualiza a hora (o filme sobe para o topo).
 * Depois, apaga o que passar dos 20 mais recentes.
 */
export async function registrarVisita(usuarioId: string, filmeId: number): Promise<void> {
  await db
    .insert(vistosRecentes)
    .values({ usuarioId, filmeId })
    .onConflictDoUpdate({ target: [vistosRecentes.usuarioId, vistosRecentes.filmeId], set: { vistoEm: sql`now()` } });

  const manter = db
    .select({ filmeId: vistosRecentes.filmeId })
    .from(vistosRecentes)
    .where(eq(vistosRecentes.usuarioId, usuarioId))
    .orderBy(desc(vistosRecentes.vistoEm))
    .limit(LIMITES.vistos);
  await db
    .delete(vistosRecentes)
    .where(and(eq(vistosRecentes.usuarioId, usuarioId), notInArray(vistosRecentes.filmeId, manter)));
}

/** Os filmes vistos recentemente (até 20), o mais recente primeiro. */
export async function listarVistos(usuarioId: string): Promise<number[]> {
  const linhas = await db
    .select({ filmeId: vistosRecentes.filmeId })
    .from(vistosRecentes)
    .where(eq(vistosRecentes.usuarioId, usuarioId))
    .orderBy(desc(vistosRecentes.vistoEm))
    .limit(LIMITES.vistos);
  return linhas.map((l) => l.filmeId);
}

/**
 * Guarda uma busca. Repetir a mesma busca (sem diferença de maiúsculas) só a sobe para o topo.
 * Depois, apaga o que passar das 5 mais recentes.
 */
export async function registrarBusca(usuarioId: string, texto: string): Promise<void> {
  const chave = chaveBusca(texto);
  await db
    .insert(buscasRecentes)
    .values({ usuarioId, texto, chave })
    .onConflictDoUpdate({
      target: [buscasRecentes.usuarioId, buscasRecentes.chave],
      set: { texto, buscadoEm: sql`now()` },
    });

  const manter = db
    .select({ chave: buscasRecentes.chave })
    .from(buscasRecentes)
    .where(eq(buscasRecentes.usuarioId, usuarioId))
    .orderBy(desc(buscasRecentes.buscadoEm))
    .limit(LIMITES.buscas);
  await db
    .delete(buscasRecentes)
    .where(and(eq(buscasRecentes.usuarioId, usuarioId), notInArray(buscasRecentes.chave, manter)));
}

/** As últimas 5 buscas, a mais recente primeiro. */
export async function listarBuscas(usuarioId: string): Promise<string[]> {
  const linhas = await db
    .select({ texto: buscasRecentes.texto })
    .from(buscasRecentes)
    .where(eq(buscasRecentes.usuarioId, usuarioId))
    .orderBy(desc(buscasRecentes.buscadoEm))
    .limit(LIMITES.buscas);
  return linhas.map((l) => l.texto);
}

/** Apaga uma busca (pelo texto) ou, com null, todas. */
export async function apagarBusca(usuarioId: string, texto: string | null): Promise<void> {
  const daPessoa = eq(buscasRecentes.usuarioId, usuarioId);
  await db
    .delete(buscasRecentes)
    .where(texto === null ? daPessoa : and(daPessoa, eq(buscasRecentes.chave, chaveBusca(texto))));
}
