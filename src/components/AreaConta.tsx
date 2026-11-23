import { obterUsuario } from "@/lib/sessao";
import { IniciarEstadoPessoal } from "./IniciarEstadoPessoal";
import { LinkEntrar } from "./LinkEntrar";
import { MenuConta } from "./MenuConta";

/** O canto da conta no topo: "Entrar" para visitantes, ou a foto com o menu para quem está logado. */
export async function AreaConta() {
  const usuario = await obterUsuario();
  if (!usuario) return <LinkEntrar />;
  return (
    <>
      <MenuConta nome={usuario.nome} foto={usuario.foto} />
      <IniciarEstadoPessoal historico={usuario.historico} />
    </>
  );
}
