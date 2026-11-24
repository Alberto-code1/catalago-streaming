import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { oAuthProxy } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { lerEnv, loginDeTesteLigado, origensConfiaveis, PRODUCAO, proxyOAuthLigado } from "./conta";

// Nas prévias da Vercel, cada endereço é diferente. A Vercel informa o endereço da prévia atual.
const previa = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const ehPrevia = process.env.VERCEL_ENV === "preview";

/** A configuração do login (biblioteca Better Auth), guardando contas e sessões no nosso banco. */
export const auth = betterAuth({
  baseURL: lerEnv(process.env, "BETTER_AUTH_URL") ?? previa,
  secret: lerEnv(process.env, "BETTER_AUTH_SECRET"),
  database: drizzleAdapter(db, { provider: "pg", schema }),
  user: {
    additionalFields: {
      historicoLigado: { type: "boolean", required: false, defaultValue: true, input: false },
    },
  },
  socialProviders: {
    google: {
      clientId: lerEnv(process.env, "GOOGLE_CLIENT_ID") ?? "",
      clientSecret: lerEnv(process.env, "GOOGLE_CLIENT_SECRET") ?? "",
      // Sempre deixa a pessoa escolher a conta (útil em computadores compartilhados)
      prompt: "select_account",
      // Nas prévias, o Google devolve a pessoa para o site oficial, que a repassa à prévia (ver oAuthProxy)
      ...(ehPrevia && { redirectURI: `${PRODUCAO}/api/auth/callback/google` }),
    },
  },
  // Login com e-mail e senha: só para o robô de testes, nunca ligado na Vercel
  emailAndPassword: { enabled: loginDeTesteLigado(process.env) },
  // O robô cria dezenas de "pessoas de teste" em segundos; a proteção contra excesso de pedidos
  // bloquearia isso. Ela só é desligada com o login de teste (nunca na Vercel).
  ...(loginDeTesteLigado(process.env) && { rateLimit: { enabled: false } }),
  session: {
    // Sem "resumo da sessão no cookie": toda visita logada confere o login no banco.
    // Assim "Sair" e "Excluir minha conta" valem na hora em todos os aparelhos.
    // (Visitantes sem login continuam sem consultar o banco.)
    cookieCache: { enabled: false },
  },
  // Só aceita pedidos de login vindos do próprio site (oficial, prévia atual ou computador)
  trustedOrigins: origensConfiaveis(process.env),
  // O "proxy" do login roda na prévia e no site oficial (que repassa a pessoa de volta à prévia).
  // No computador fica desligado: o Google devolve direto para o localhost.
  plugins: [...(proxyOAuthLigado(process.env) ? [oAuthProxy({ productionURL: PRODUCAO })] : []), nextCookies()],
  // Não manda dados de uso da biblioteca para ninguém
  telemetry: { enabled: false },
});
