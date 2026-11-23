import "server-only";
import { and, desc, eq, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { vistosRecentes } from "@/db/schema";
import { LIMITES } from "../listas";

// O histórico da pessoa: filmes abertos e (na próxima etapa) buscas.
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
