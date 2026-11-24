import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { auth } from "./auth";
import { comPadraoSeFalhar } from "./conta";

/** A pessoa logada, do jeito que o site usa. */
export type Usuario = { id: string; nome: string; email: string; foto: string | null; historico: boolean };

/**
 * Quem está logado nesta visita, ou null.
 * - Sem o cookie de login, nem consulta o banco (visitantes não pagam esse custo).
 * - Se o banco falhar, trata como "não logado" em vez de derrubar a página.
 * Lida uma vez por pedido, mesmo que vários componentes perguntem.
 */
export const obterUsuario = cache(async (): Promise<Usuario | null> => {
  const cabecalhos = await headers();
  if (!cabecalhos.get("cookie")?.includes("better-auth.")) return null;
  // A conferência da sessão olha o relógio (expirou?): só pode rodar na hora do pedido real,
  // nunca numa versão da página preparada com antecedência
  await connection();

  return comPadraoSeFalhar(async () => {
    const sessao = await auth.api.getSession({ headers: cabecalhos });
    if (!sessao) return null;
    const u = sessao.user;
    return { id: u.id, nome: u.name, email: u.email, foto: u.image ?? null, historico: u.historicoLigado !== false };
  }, null);
});

/** Como obterUsuario, mas manda para /entrar quem não está logado (e volta para `volta` depois). */
export async function exigirUsuario(volta: string): Promise<Usuario> {
  const usuario = await obterUsuario();
  if (!usuario) redirect(`/entrar?volta=${encodeURIComponent(volta)}`);
  return usuario;
}
