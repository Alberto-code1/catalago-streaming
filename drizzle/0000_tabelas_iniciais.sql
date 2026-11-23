CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assistidos" (
	"usuario_id" text NOT NULL,
	"filme_id" integer NOT NULL,
	"nota" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assistidos_usuario_id_filme_id_pk" PRIMARY KEY("usuario_id","filme_id"),
	CONSTRAINT "assistidos_nota_valida" CHECK ("assistidos"."nota" in ('gostei', 'nao_gostei'))
);
--> statement-breakpoint
CREATE TABLE "buscas_recentes" (
	"usuario_id" text NOT NULL,
	"texto" text NOT NULL,
	"chave" text NOT NULL,
	"buscado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "buscas_recentes_usuario_id_chave_pk" PRIMARY KEY("usuario_id","chave")
);
--> statement-breakpoint
CREATE TABLE "quero_assistir" (
	"usuario_id" text NOT NULL,
	"filme_id" integer NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quero_assistir_usuario_id_filme_id_pk" PRIMARY KEY("usuario_id","filme_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"historico_ligado" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vistos_recentes" (
	"usuario_id" text NOT NULL,
	"filme_id" integer NOT NULL,
	"visto_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vistos_recentes_usuario_id_filme_id_pk" PRIMARY KEY("usuario_id","filme_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistidos" ADD CONSTRAINT "assistidos_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buscas_recentes" ADD CONSTRAINT "buscas_recentes_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quero_assistir" ADD CONSTRAINT "quero_assistir_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vistos_recentes" ADD CONSTRAINT "vistos_recentes_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assistidos_usuario_data_idx" ON "assistidos" USING btree ("usuario_id","criado_em" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "buscas_usuario_data_idx" ON "buscas_recentes" USING btree ("usuario_id","buscado_em" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "quero_usuario_data_idx" ON "quero_assistir" USING btree ("usuario_id","criado_em" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "vistos_usuario_data_idx" ON "vistos_recentes" USING btree ("usuario_id","visto_em" DESC NULLS LAST);