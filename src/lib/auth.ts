import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

/** A configuração do login (biblioteca Better Auth), guardando contas e sessões no nosso banco. */
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  user: {
    additionalFields: {
      historicoLigado: { type: "boolean", required: false, defaultValue: true, input: false },
    },
  },
  session: {
    // Guarda um resumo da sessão no próprio cookie por 5 minutos: menos consultas ao banco
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // Não manda dados de uso da biblioteca para ninguém
  telemetry: { enabled: false },
});
