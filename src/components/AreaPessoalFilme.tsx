import Link from "next/link";
import { comPadraoSeFalhar } from "@/lib/conta";
import { estadoDoFilme } from "@/lib/dados/listas";
import { obterUsuario } from "@/lib/sessao";
import { BotoesLista } from "./BotoesLista";
import styles from "./BotoesLista.module.css";

/**
 * A parte pessoal da página do filme. Carrega depois do resto (fica num Suspense):
 * - visitante: botões que levam para "Entrar" e voltam a este filme;
 * - pessoa logada: os botões de lista, já com o estado salvo.
 */
export async function AreaPessoalFilme({ filmeId }: { filmeId: number }) {
  const usuario = await obterUsuario();
  if (!usuario) {
    const entrar = `/entrar?volta=${encodeURIComponent(`/filme/${filmeId}`)}`;
    return (
      <div className={styles.area}>
        <div className={styles.botoes}>
          <Link href={entrar} className={styles.botao}>
            + Quero assistir
          </Link>
        </div>
        <p className={styles.dica}>Entre para guardar seus filmes.</p>
      </div>
    );
  }

  const estado = await comPadraoSeFalhar(() => estadoDoFilme(usuario.id, filmeId), null);
  if (!estado) {
    return <p className={styles.aviso}>Não foi possível carregar sua lista agora.</p>;
  }
  return <BotoesLista filmeId={filmeId} inicial={estado} />;
}
