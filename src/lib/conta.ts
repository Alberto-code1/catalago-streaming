// Regras pequenas (sem banco e sem navegador) usadas pelo login.

/**
 * Para onde voltar depois de entrar. Só aceita um caminho do próprio site
 * ("/filme/123"); qualquer outra coisa (outro site, "//site.com") vira "/".
 * Isso impede que um link malicioso use o nosso login para mandar a pessoa a outro site.
 */
export function lerVolta(valor: unknown): string {
  if (typeof valor !== "string") return "/";
  // Caracteres invisíveis (tab, quebra de linha...) são apagados pelo navegador e podem
  // transformar "/\t/site.com" em "//site.com": qualquer um deles já recusa o endereço
  if (/[\u0000-\u001f\u007f]/.test(valor)) return "/";
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

/** O endereço oficial do site: o Google só devolve a pessoa para endereços cadastrados. */
export const PRODUCAO = "https://catalogo-streaming-one.vercel.app";

/**
 * O "proxy" do login liga em toda a Vercel: na prévia ele manda o Google devolver a pessoa
 * ao site oficial, e no site oficial ele a repassa de volta à prévia. No computador, desligado.
 */
export function proxyOAuthLigado(env: Record<string, string | undefined>): boolean {
  return !!env.VERCEL;
}

/** De onde o login aceita pedidos: o site oficial, a prévia atual (e o endereço do ramo) ou o computador. */
export function origensConfiaveis(env: Record<string, string | undefined>): string[] {
  const origens = [
    PRODUCAO,
    env.VERCEL_URL && `https://${env.VERCEL_URL}`,
    env.VERCEL_BRANCH_URL && `https://${env.VERCEL_BRANCH_URL}`,
    env.BETTER_AUTH_URL,
  ];
  return [...new Set(origens.filter((o): o is string => !!o))];
}
