import { comPadraoSeFalhar } from "@/lib/conta";
import { listarBuscas } from "@/lib/dados/historico";
import { idsAssistidos } from "@/lib/dados/listas";
import { obterUsuario } from "@/lib/sessao";
import { IniciarEstadoPessoal } from "./IniciarEstadoPessoal";
import { LinkEntrar } from "./LinkEntrar";
import { MenuConta } from "./MenuConta";

/** O canto da conta no topo: "Entrar" para visitantes, ou a foto com o menu para quem está logado. */
export async function AreaConta() {
  const usuario = await obterUsuario();
  if (!usuario) return <LinkEntrar />;
  // Os filmes já assistidos alimentam a marquinha "✓ visto" dos cartões (se o banco falhar, fica sem marquinha)
  // e as buscas recentes aparecem ao clicar na caixa de busca
  const [assistidos, buscas] = await Promise.all([
    comPadraoSeFalhar(() => idsAssistidos(usuario.id), []),
    usuario.historico ? comPadraoSeFalhar(() => listarBuscas(usuario.id), []) : [],
  ]);
  return (
    <>
      <MenuConta nome={usuario.nome} foto={usuario.foto} />
      <IniciarEstadoPessoal historico={usuario.historico} assistidos={assistidos} buscas={buscas} />
    </>
  );
}
