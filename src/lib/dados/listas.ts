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

/**
 * Marca ou desmarca o filme como assistido.
 * Ao marcar, ele sai de "Quero assistir" na mesma operação (as duas coisas acontecem juntas ou nenhuma).
 * Ao desmarcar, a nota vai junto.
 */
export async function marcarAssistido(usuarioId: string, filmeId: number, marcado: boolean): Promise<"ok" | "limite"> {
  const daPessoa = eq(assistidos.usuarioId, usuarioId);
  const esteFilme = and(daPessoa, eq(assistidos.filmeId, filmeId));
  if (!marcado) {
    await db.delete(assistidos).where(esteFilme);
    return "ok";
  }
  return db.transaction(async (tx) => {
    const [{ total }] = await tx.select({ total: count() }).from(assistidos).where(daPessoa);
    if (total >= LIMITES.assistidos) {
      const jaTem = await tx.select().from(assistidos).where(esteFilme);
      if (jaTem.length === 0) return "limite" as const;
    }
    await tx.insert(assistidos).values({ usuarioId, filmeId }).onConflictDoNothing();
    await tx
      .delete(queroAssistir)
      .where(and(eq(queroAssistir.usuarioId, usuarioId), eq(queroAssistir.filmeId, filmeId)));
    return "ok" as const;
  });
}

/** Dá ou tira a nota (👍/👎) de um filme. Só vale para filmes já marcados como assistidos. */
export async function darNota(usuarioId: string, filmeId: number, nota: Nota): Promise<void> {
  await db
    .update(assistidos)
    .set({ nota })
    .where(and(eq(assistidos.usuarioId, usuarioId), eq(assistidos.filmeId, filmeId)));
}

/** Uma página de "Já assisti", o mais recente primeiro, com a nota de cada um. */
export async function listarAssistidos(
  usuarioId: string,
  pagina: number,
): Promise<{ itens: { filmeId: number; nota: Nota }[]; total: number }> {
  const daPessoa = eq(assistidos.usuarioId, usuarioId);
  const [linhas, [{ total }]] = await Promise.all([
    db
      .select({ filmeId: assistidos.filmeId, nota: assistidos.nota })
      .from(assistidos)
      .where(daPessoa)
      .orderBy(desc(assistidos.criadoEm), desc(assistidos.filmeId))
      .limit(LIMITES.porPagina)
      .offset((pagina - 1) * LIMITES.porPagina),
    db.select({ total: count() }).from(assistidos).where(daPessoa),
  ]);
  return { itens: linhas.map((l) => ({ filmeId: l.filmeId, nota: (l.nota as Nota) ?? null })), total };
}

/** Os ids de todos os filmes assistidos (para a marquinha "✓ visto" nos cartões). */
export async function idsAssistidos(usuarioId: string): Promise<number[]> {
  const linhas = await db.select({ filmeId: assistidos.filmeId }).from(assistidos).where(eq(assistidos.usuarioId, usuarioId));
  return linhas.map((l) => l.filmeId);
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
