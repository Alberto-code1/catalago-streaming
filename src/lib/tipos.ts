// Formatos de dados usados no site inteiro.

/** Um gênero de filme (lista do TMDB, em português). */
export type Genero = { id: number; nome: string };

/** Um serviço de streaming que aparece nos botões de filtro. */
export type Servico = { slug: string; nome: string; providerId: number; cor: string };

/** O resumo de um filme, usado nos cartões da grade. */
export type FilmeResumo = { id: number; titulo: string; ano: string; nota: number; capa: string | null };

/** Uma página de resultados do catálogo. */
export type PaginaFilmes = { filmes: FilmeResumo[]; pagina: number; totalPaginas: number };

/** Um serviço onde o filme pode ser assistido. */
export type Provedor = { id: number; nome: string; logo: string | null };

/** Um ator do elenco. */
export type Ator = { id: number; nome: string; personagem: string; foto: string | null };

/** Tudo o que a página de um filme mostra. */
export type DetalheFilme = {
  id: number;
  titulo: string;
  ano: string;
  nota: number;
  duracaoMin: number | null;
  generos: string[];
  sinopse: string;
  capa: string | null;
  fundo: string | null;
  ondeAssistir: Provedor[];
  trailerKey: string | null;
  elenco: Ator[];
};

// Formatos "crus", do jeito que o TMDB devolve.
export type TmdbVideo = { key: string; site: string; type: string; iso_639_1: string; official?: boolean };
export type TmdbProv = { provider_id: number; provider_name: string; logo_path: string | null };
export type TmdbProvedoresBR = { flatrate?: TmdbProv[]; free?: TmdbProv[]; ads?: TmdbProv[] };
