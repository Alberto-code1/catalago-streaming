import { servicosDisponiveis, textoSelo } from "@/lib/busca";
import type { Aba, Nota } from "@/lib/listas";
import type { FilmeResumo, Servico } from "@/lib/tipos";
import { BotaoRemover } from "./BotaoRemover";
import { CartaoFilme } from "./CartaoFilme";
import styles from "./ItemLista.module.css";

/** Um filme da Minha conta já com os dados do TMDB (ou null se o TMDB falhou para ele). */
export type FilmeDaLista = { id: number; filme: (FilmeResumo & { servicos: Servico[] | null }) | null; nota?: Nota };

/** O cartão de um filme numa lista da Minha conta, com o selo "onde está agora" e o botão "Remover". */
export function ItemLista({ item, lista }: { item: FilmeDaLista; lista: Aba }) {
  const { filme } = item;
  const texto = filme ? textoSelo(filme.servicos) : null;
  const titulo = filme?.titulo ?? `Filme #${item.id}`;
  return (
    <div className={styles.item} data-testid="item-lista">
      {filme ? (
        <CartaoFilme
          filme={filme}
          selo={texto ? { texto, disponivel: (filme.servicos?.length ?? 0) > 0 } : undefined}
        />
      ) : (
        <div className={styles.semFilme}>{titulo}</div>
      )}
      {item.nota && (
        <p className={styles.nota}>{item.nota === "gostei" ? "👍 Gostei" : "👎 Não gostei"}</p>
      )}
      <BotaoRemover lista={lista} filmeId={item.id} titulo={titulo} />
    </div>
  );
}

/** Monta o resumo do filme para a lista a partir dos detalhes do TMDB. */
export function resumoDaLista(
  id: number,
  detalhe: { titulo: string; ano: string; nota: number; capa: string | null; ondeAssistir: { id: number }[] } | null,
): FilmeDaLista["filme"] {
  if (!detalhe) return null;
  return {
    id,
    titulo: detalhe.titulo,
    ano: detalhe.ano,
    nota: detalhe.nota,
    capa: detalhe.capa,
    servicos: servicosDisponiveis(detalhe.ondeAssistir.map((p) => p.id)),
  };
}
