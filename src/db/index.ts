import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * A conexão com o banco de dados. O endereço (com a senha) vem da variável
 * DATABASE_URL, que fica só em .env.local e na Vercel.
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

// Na Vercel, fecha as conexões paradas antes de a função "dormir"
attachDatabasePool(pool);

export const db = drizzle(pool, { schema });
