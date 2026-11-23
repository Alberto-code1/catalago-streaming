/** Erro de conversa com o TMDB, com o código HTTP (ex.: 404 = não encontrado). */
export class TmdbErro extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "TmdbErro";
  }
}

/**
 * Diz se um erro veio do TMDB. Confere pelo nome, e não com `instanceof`,
 * porque o "use cache" recria o erro como um Error comum (mantendo só o nome).
 */
export function ehErroTmdb(erro: unknown): boolean {
  return erro instanceof Error && erro.name === "TmdbErro";
}
