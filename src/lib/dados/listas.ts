import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { assistidos, queroAssistir, vistosRecentes } from "@/db/schema";
import { type Aba, LIMITES, type Nota } from "../listas";

// Leitura e gravação das listas de cada pessoa no banco.
// Quem chama já conferiu a sessão: o usuarioId vem sempre do login, nunca de fora.

/** Como o filme está nas listas da pessoa (para os botões da página do filme). */
export async function estadoDoFilme(
  usuarioId: string,
  filmeId: number,
): Promise<{ quero: boolean; assistido: boolean; nota: Nota }> {
  const [quero, visto] = await Promise.all([
    db
      .select({ filmeId: queroAssistir.filmeId })
      .from(queroAssistir)
      .where(and(eq(queroAssistir.usuarioId, usuarioId), eq(queroAssistir.filmeId, filmeId))),
    db
      .select({ nota: assistidos.nota })
      .from(assistidos)
      .where(and(eq(assistidos.usuarioId, usuarioId), eq(assistidos.filmeId, filmeId))),
  ]);
  return { quero: quero.length > 0, assistido: visto.length > 0, nota: (visto[0]?.nota as Nota) ?? null };
}

/**
 * Põe ou tira o filme de "Quero assistir". Gravar duas vezes não duplica (chave única).
 * Devolve "limite" se a lista já tem 500 filmes e este ainda não está nela.
 */
export async function marcarQuero(usuarioId: string, filmeId: number, marcado: boolean): Promise<"ok" | "limite"> {
  const daPessoa = eq(queroAssistir.usuarioId, usuarioId);
  if (!marcado) {
    await db.delete(queroAssistir).where(and(daPessoa, eq(queroAssistir.filmeId, filmeId)));
    return "ok";
  }
  const [{ total }] = await db.select({ total: count() }).from(queroAssistir).where(daPessoa);
  if (total >= LIMITES.quero) {
    const jaTem = await db.select().from(queroAssistir).where(and(daPessoa, eq(queroAssistir.filmeId, filmeId)));
    if (jaTem.length === 0) return "limite";
  }
  await db.insert(queroAssistir).values({ usuarioId, filmeId }).onConflictDoNothing();
  return "ok";
}

/** Uma página de "Quero assistir", a mais recente primeiro. */
export async function listarQuero(usuarioId: string, pagina: number): Promise<{ ids: number[]; total: number }> {
  const daPessoa = eq(queroAssistir.usuarioId, usuarioId);
  const [linhas, [{ total }]] = await Promise.all([
    db
      .select({ filmeId: queroAssistir.filmeId })
      .from(queroAssistir)
      .where(daPessoa)
      .orderBy(desc(queroAssistir.criadoEm), desc(queroAssistir.filmeId))
      .limit(LIMITES.porPagina)
      .offset((pagina - 1) * LIMITES.porPagina),
    db.select({ total: count() }).from(queroAssistir).where(daPessoa),
  ]);
  return { ids: linhas.map((l) => l.filmeId), total };
}

/** Tira um filme de uma das três listas da Minha conta. */
export async function removerDe(usuarioId: string, lista: Aba, filmeId: number): Promise<void> {
  if (lista === "quero") {
    await marcarQuero(usuarioId, filmeId, false);
  } else if (lista === "assistidos") {
    await db.delete(assistidos).where(and(eq(assistidos.usuarioId, usuarioId), eq(assistidos.filmeId, filmeId)));
  } else {
    await db
      .delete(vistosRecentes)
      .where(and(eq(vistosRecentes.usuarioId, usuarioId), eq(vistosRecentes.filmeId, filmeId)));
  }
}
