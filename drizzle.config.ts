import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Lê o DATABASE_URL do .env.local (no computador) ou do ambiente (Vercel e GitHub)
loadEnvConfig(process.cwd());

/** Configuração das migrações: os arquivos .sql que criam e atualizam as tabelas ficam em drizzle/. */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
