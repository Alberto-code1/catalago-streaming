// Regras pequenas (sem banco e sem navegador) usadas pelo login.

/**
 * Para onde voltar depois de entrar. Só aceita um caminho do próprio site
 * ("/filme/123"); qualquer outra coisa (outro site, "//site.com") vira "/".
 * Isso impede que um link malicioso use o nosso login para mandar a pessoa a outro site.
 */
export function lerVolta(valor: unknown): string {
  if (typeof valor !== "string") return "/";
  if (!valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) return "/";
  return valor;
}

/**
 * Roda a função e, se ela falhar (ex.: banco fora do ar), devolve o padrão
 * em vez de derrubar a página. O erro fica registrado no log do servidor.
 */
export async function comPadraoSeFalhar<T>(fn: () => Promise<T>, padrao: T): Promise<T> {
  try {
    return await fn();
  } catch (erro) {
    console.error("Falha ao acessar dados pessoais:", erro);
    return padrao;
  }
}

/**
 * O "login de teste" (e-mail e senha, só para o robô de testes) liga apenas
 * com LOGIN_DE_TESTE=1 e nunca na Vercel, que sempre define VERCEL=1.
 */
export function loginDeTesteLigado(env: Record<string, string | undefined>): boolean {
  return env.LOGIN_DE_TESTE === "1" && !env.VERCEL;
}
