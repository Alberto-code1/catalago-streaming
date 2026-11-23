import type { NextRequest } from "next/server";
import { lerPagina } from "@/lib/discover";
import { servicoPorSlug } from "@/lib/servicos";
import { TmdbErro, buscarFilmes } from "@/lib/tmdb";

/**
 * GET /api/filmes?servico=netflix&pagina=2
 * Devolve mais uma página de filmes para o botão "Carregar mais".
 * Roda no servidor: o navegador nunca vê o token do TMDB.
 */
export async function GET(request: NextRequest) {
  const busca = request.nextUrl.searchParams;
  const servico = servicoPorSlug(busca.get("servico"));
  const pagina = lerPagina(busca.get("pagina"));

  try {
    const resultado = await buscarFilmes(servico?.slug, pagina);
    // Pediram uma página depois da última: devolve lista vazia
    if (pagina > resultado.totalPaginas) {
      return Response.json({ filmes: [], pagina, totalPaginas: resultado.totalPaginas });
    }
    return Response.json(resultado);
  } catch (erro) {
    if (erro instanceof TmdbErro) {
      return Response.json(
        { erro: "Não foi possível carregar os filmes agora. Tente de novo em instantes." },
        { status: 502 },
      );
    }
    throw erro;
  }
}
