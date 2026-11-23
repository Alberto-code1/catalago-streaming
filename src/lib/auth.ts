import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { oAuthProxy } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { loginDeTesteLigado } from "./conta";

/** O endereço oficial do site: o Google só devolve a pessoa para endereços cadastrados. */
const PRODUCAO = "https://catalogo-streaming-one.vercel.app";

// Nas prévias da Vercel, cada endereço é diferente. A Vercel informa o endereço da prévia atual.
const previa = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const ehPrevia = process.env.VERCEL_ENV === "preview";

/** A configuração do login (biblioteca Better Auth), guardando contas e sessões no nosso banco. */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? previa,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  user: {
    additionalFields: {
      historicoLigado: { type: "boolean", required: false, defaultValue: true, input: false },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Sempre deixa a pessoa escolher a conta (útil em computadores compartilhados)
      prompt: "select_account",
      // Nas prévias, o Google devolve a pessoa para o site oficial, que a repassa à prévia (ver oAuthProxy)
      ...(ehPrevia && { redirectURI: `${PRODUCAO}/api/auth/callback/google` }),
    },
  },
  // Login com e-mail e senha: só para o robô de testes, nunca ligado na Vercel
  emailAndPassword: { enabled: loginDeTesteLigado(process.env) },
  session: {
    // Guarda um resumo da sessão no próprio cookie por 5 minutos: menos consultas ao banco
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // Só aceita pedidos de login vindos do próprio site (oficial, prévia atual ou computador)
  trustedOrigins: [PRODUCAO, previa, process.env.BETTER_AUTH_URL].filter((o): o is string => !!o),
  // O "proxy" do login só vale nas prévias: no computador e no site oficial, o Google devolve direto
  plugins: [...(ehPrevia ? [oAuthProxy({ productionURL: PRODUCAO })] : []), nextCookies()],
  // Não manda dados de uso da biblioteca para ninguém
  telemetry: { enabled: false },
});
