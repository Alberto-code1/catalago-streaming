// As tabelas do banco de dados (Postgres, na Neon).
// As 4 primeiras são as que a biblioteca de login (Better Auth) precisa.
// As 4 últimas são do site: listas e histórico de cada pessoa.
// Toda tabela ligada a uma pessoa usa "on delete cascade": excluir a conta apaga tudo dela.
import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

const agora = (nome = "created_at") => timestamp(nome, { withTimezone: true }).notNull().defaultNow();

/** A pessoa: nome, e-mail e foto vindos do Google, e a preferência de histórico. */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  historicoLigado: boolean("historico_ligado").notNull().default(true),
  createdAt: agora(),
  updatedAt: agora("updated_at").$onUpdate(() => new Date()),
});

/** Cada login aberto (o cookie do navegador aponta para uma linha daqui). */
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: agora(),
    updatedAt: agora("updated_at").$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

/** A ligação da pessoa com a conta do Google. */
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: agora(),
    updatedAt: agora("updated_at").$onUpdate(() => new Date()),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

/** Códigos temporários usados durante o login (a biblioteca cuida sozinha). */
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: agora(),
    updatedAt: agora("updated_at").$onUpdate(() => new Date()),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

const dono = () =>
  text("usuario_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

/** "Quero assistir": um filme (id do TMDB) por linha. */
export const queroAssistir = pgTable(
  "quero_assistir",
  { usuarioId: dono(), filmeId: integer("filme_id").notNull(), criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow() },
  (t) => [primaryKey({ columns: [t.usuarioId, t.filmeId] }), index("quero_usuario_data_idx").on(t.usuarioId, t.criadoEm.desc())],
);

/** "Já assisti", com a nota opcional: 'gostei', 'nao_gostei' ou vazia. */
export const assistidos = pgTable(
  "assistidos",
  {
    usuarioId: dono(),
    filmeId: integer("filme_id").notNull(),
    nota: text("nota"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.usuarioId, t.filmeId] }),
    index("assistidos_usuario_data_idx").on(t.usuarioId, t.criadoEm.desc()),
    check("assistidos_nota_valida", sql`${t.nota} in ('gostei', 'nao_gostei')`),
  ],
);

/** "Vistos recentemente": os filmes abertos no site (guarda os 20 últimos). */
export const vistosRecentes = pgTable(
  "vistos_recentes",
  { usuarioId: dono(), filmeId: integer("filme_id").notNull(), vistoEm: timestamp("visto_em", { withTimezone: true }).notNull().defaultNow() },
  (t) => [primaryKey({ columns: [t.usuarioId, t.filmeId] }), index("vistos_usuario_data_idx").on(t.usuarioId, t.vistoEm.desc())],
);

/** "Buscas recentes" (guarda as 5 últimas). A chave é o texto em minúsculas, para não repetir. */
export const buscasRecentes = pgTable(
  "buscas_recentes",
  {
    usuarioId: dono(),
    texto: text("texto").notNull(),
    chave: text("chave").notNull(),
    buscadoEm: timestamp("buscado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.chave] }), index("buscas_usuario_data_idx").on(t.usuarioId, t.buscadoEm.desc())],
);
