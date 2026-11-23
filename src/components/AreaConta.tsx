import { comPadraoSeFalhar } from "@/lib/conta";
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
  const assistidos = await comPadraoSeFalhar(() => idsAssistidos(usuario.id), []);
  return (
    <>
      <MenuConta nome={usuario.nome} foto={usuario.foto} />
      <IniciarEstadoPessoal historico={usuario.historico} assistidos={assistidos} />
    </>
  );
}
