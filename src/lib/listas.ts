// Regras pequenas (sem banco) das listas e do histórico.

import { normalizarBusca } from "./busca";

/** Os limites combinados no design da Fase 3. */
export const LIMITES = { quero: 500, assistidos: 2000, vistos: 20, buscas: 5, porPagina: 24 } as const;

/** O maior número que cabe na coluna "filme_id" do banco (integer do Postgres). */
const MAIOR_ID = 2_147_483_647;

/**
 * Confere o id de um filme vindo de fora (botão, endereço): só aceita um inteiro
 * positivo que caiba no banco. Qualquer outra coisa vira null e a ação é recusada.
 */
export function lerIdFilme(valor: unknown): number | null {
  const texto = typeof valor === "number" ? String(valor) : valor;
  if (typeof texto !== "string" || !/^[1-9]\d{0,9}$/.test(texto)) return null;
  const id = Number(texto);
  return id <= MAIOR_ID ? id : null;
}

/** A nota de um filme assistido: gostei, não gostei ou nenhuma. */
export type Nota = "gostei" | "nao_gostei" | null;

/** Confere uma nota vinda do navegador. undefined = valor inválido (a ação é recusada). */
export function lerNota(valor: unknown): Nota | undefined {
  return valor === "gostei" || valor === "nao_gostei" || valor === null ? valor : undefined;
}

/** As abas da página Minha conta. */
export type Aba = "quero" | "assistidos" | "recentes";

/** Lê a aba do endereço (?aba=...); qualquer valor estranho vira "quero". */
export function lerAba(valor: unknown): Aba {
  return valor === "assistidos" || valor === "recentes" ? valor : "quero";
}

/**
 * A "chave" de uma busca recente: o texto limpo (como na página de busca) e em minúsculas.
 * "Duna" e "  duna " são a mesma busca e não se repetem na lista.
 */
export function chaveBusca(texto: string): string {
  return (normalizarBusca(texto) ?? texto.trim()).toLowerCase();
}

/** O arquivo "Baixar meus dados" (LGPD): tudo o que o site guarda sobre a pessoa. */
export type ExportacaoDados = {
  geradoEm: string;
  conta: { nome: string; email: string; criadaEm: string };
  historicoLigado: boolean;
  queroAssistir: { filmeId: number; desde: string }[];
  assistidos: { filmeId: number; nota: Nota; desde: string }[];
  vistosRecentemente: { filmeId: number; em: string }[];
  buscasRecentes: { texto: string; em: string }[];
};

/** As linhas do banco que entram no arquivo. */
type LinhasDaPessoa = {
  agora: Date;
  conta: { name: string; email: string; createdAt: Date; historicoLigado: boolean };
  quero: { filmeId: number; criadoEm: Date }[];
  assistidos: { filmeId: number; nota: string | null; criadoEm: Date }[];
  vistos: { filmeId: number; vistoEm: Date }[];
  buscas: { texto: string; buscadoEm: Date }[];
};

/** Monta o arquivo de dados da pessoa, com as datas em texto (formato ISO). Nada de sessão ou senha entra. */
export function montarExportacao(l: LinhasDaPessoa): ExportacaoDados {
  return {
    geradoEm: l.agora.toISOString(),
    conta: { nome: l.conta.name, email: l.conta.email, criadaEm: l.conta.createdAt.toISOString() },
    historicoLigado: l.conta.historicoLigado,
    queroAssistir: l.quero.map((q) => ({ filmeId: q.filmeId, desde: q.criadoEm.toISOString() })),
    assistidos: l.assistidos.map((a) => ({
      filmeId: a.filmeId,
      nota: lerNota(a.nota) ?? null,
      desde: a.criadoEm.toISOString(),
    })),
    vistosRecentemente: l.vistos.map((v) => ({ filmeId: v.filmeId, em: v.vistoEm.toISOString() })),
    buscasRecentes: l.buscas.map((b) => ({ texto: b.texto, em: b.buscadoEm.toISOString() })),
  };
}
