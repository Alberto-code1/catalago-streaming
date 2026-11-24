import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { account, assistidos, buscasRecentes, queroAssistir, session, user, vistosRecentes } from "@/db/schema";
import { type ExportacaoDados, montarExportacao } from "../listas";

// Os direitos da pessoa sobre os próprios dados (LGPD): ver/baixar, apagar o histórico,
// desligar o histórico e excluir a conta. Quem chama já conferiu a sessão.

/** Se a pessoa deixou o histórico ligado (lido direto do banco, sempre atualizado). */
export async function historicoLigado(usuarioId: string): Promise<boolean> {
  const [linha] = await db.select({ ligado: user.historicoLigado }).from(user).where(eq(user.id, usuarioId));
  return linha?.ligado ?? false;
}

/** Apaga os vistos recentemente e as buscas recentes. */
export async function apagarHistorico(usuarioId: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(vistosRecentes).where(eq(vistosRecentes.usuarioId, usuarioId));
    await tx.delete(buscasRecentes).where(eq(buscasRecentes.usuarioId, usuarioId));
  });
}

/** Liga ou desliga o histórico. Ao desligar, o histórico que já existia é apagado. */
export async function definirHistorico(usuarioId: string, ligado: boolean): Promise<void> {
  await db.update(user).set({ historicoLigado: ligado }).where(eq(user.id, usuarioId));
  if (!ligado) await apagarHistorico(usuarioId);
}

/** Tudo o que o site guarda sobre a pessoa, para o arquivo "Baixar meus dados". */
export async function exportarDados(usuarioId: string): Promise<ExportacaoDados | null> {
  const [conta] = await db
    .select({ name: user.name, email: user.email, createdAt: user.createdAt, historicoLigado: user.historicoLigado })
    .from(user)
    .where(eq(user.id, usuarioId));
  if (!conta) return null;

  const [quero, vistos, assistiu, buscas, sessoes, contas] = await Promise.all([
    db
      .select({ filmeId: queroAssistir.filmeId, criadoEm: queroAssistir.criadoEm })
      .from(queroAssistir)
      .where(eq(queroAssistir.usuarioId, usuarioId))
      .orderBy(desc(queroAssistir.criadoEm)),
    db
      .select({ filmeId: vistosRecentes.filmeId, vistoEm: vistosRecentes.vistoEm })
      .from(vistosRecentes)
      .where(eq(vistosRecentes.usuarioId, usuarioId))
      .orderBy(desc(vistosRecentes.vistoEm)),
    db
      .select({ filmeId: assistidos.filmeId, nota: assistidos.nota, criadoEm: assistidos.criadoEm })
      .from(assistidos)
      .where(eq(assistidos.usuarioId, usuarioId))
      .orderBy(desc(assistidos.criadoEm)),
    db
      .select({ texto: buscasRecentes.texto, buscadoEm: buscasRecentes.buscadoEm })
      .from(buscasRecentes)
      .where(eq(buscasRecentes.usuarioId, usuarioId))
      .orderBy(desc(buscasRecentes.buscadoEm)),
    // Só datas, IP e navegador: o código secreto da sessão (token) nunca sai do banco
    db
      .select({
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      })
      .from(session)
      .where(eq(session.userId, usuarioId))
      .orderBy(desc(session.createdAt)),
    db
      .select({ providerId: account.providerId, createdAt: account.createdAt })
      .from(account)
      .where(eq(account.userId, usuarioId)),
  ]);
  return montarExportacao({ agora: new Date(), conta, quero, assistidos: assistiu, vistos, buscas, sessoes, contas });
}

/** Exclui a conta. O banco apaga junto, sozinho, sessões, listas e histórico ("on delete cascade"). */
export async function excluirConta(usuarioId: string): Promise<void> {
  await db.delete(user).where(eq(user.id, usuarioId));
}
