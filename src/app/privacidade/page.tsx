import type { Metadata } from "next";
import Link from "next/link";
import styles from "../sobre/page.module.css";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Quais dados o Catálogo Streaming guarda, para quê, onde e como você controla tudo.",
};

const CONTATO = "catalogostreamingof@gmail.com";

/** Política de privacidade (LGPD), em português simples. */
export default function Privacidade() {
  return (
    <article className={styles.sobre}>
      <h1>Privacidade</h1>
      <p>
        Esta página explica, sem juridiquês, quais dados o Catálogo Streaming guarda quando você entra com a sua conta,
        para que eles servem e como você controla tudo. Ela segue a Lei Geral de Proteção de Dados (LGPD, Lei nº
        13.709/2018).
      </p>

      <h2>Sem entrar na conta</h2>
      <p>
        Você pode usar o catálogo, a busca e as páginas dos filmes sem conta. Nesse caso não guardamos nada sobre você.
        Usamos as estatísticas da Vercel para contar visitas e medir a velocidade do site; elas não usam cookies e não
        identificam você.
      </p>

      <h2>O que guardamos quando você entra</h2>
      <ul>
        <li>
          <strong>Do Google:</strong> seu nome, e-mail e foto de perfil. Não temos acesso à sua senha nem a nada da sua
          conta Google além disso.
        </li>
        <li>
          <strong>Suas listas:</strong> os filmes em &quot;Quero assistir&quot; e em &quot;Já assisti&quot;, com a nota
          👍/👎, se você der.
        </li>
        <li>
          <strong>Seu histórico (se estiver ligado):</strong> os últimos 20 filmes que você abriu e as últimas 5
          buscas.
        </li>
        <li>
          <strong>Dados do login:</strong> para manter você conectado e proteger a conta, cada login guarda a data, o
          endereço IP e o tipo de navegador.
        </li>
      </ul>
      <p>De cada filme, guardamos só o número dele no TMDB. Título, capa e onde assistir são buscados na hora.</p>

      <h2>Para que usamos</h2>
      <p>
        Só para as funções do próprio site: mostrar suas listas, seu histórico e a marquinha &quot;✓ visto&quot;. Não
        vendemos nem compartilhamos seus dados, não mostramos anúncios e não usamos seus dados para nenhum outro fim. A
        base legal é a execução do serviço que você pediu ao criar a conta (LGPD, art. 7º, V).
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos apenas os cookies essenciais do login, que lembram que você entrou. Sem eles, não dá para manter você
        conectado. Não usamos cookies de propaganda nem de rastreamento.
      </p>

      <h2>Onde os dados ficam</h2>
      <p>
        O site roda na Vercel e o banco de dados fica na Neon. Os servidores dessas empresas ficam nos Estados Unidos,
        então seus dados são guardados fora do Brasil, com conexão protegida (criptografada).
      </p>

      <h2>Por quanto tempo</h2>
      <p>
        Até você apagar. O histórico guarda só os itens mais recentes, e os mais antigos saem sozinhos. Ao excluir a
        conta, tudo é apagado na hora.
      </p>

      <h2>Seus direitos, na prática</h2>
      <p>
        Na página <Link href="/minha-conta">Minha conta</Link>, a qualquer momento, você pode:
      </p>
      <ul>
        <li>
          <strong>ver</strong> suas listas e seu histórico;
        </li>
        <li>
          <strong>baixar</strong> todos os seus dados num arquivo (&quot;Baixar meus dados&quot;);
        </li>
        <li>
          <strong>desligar</strong> o histórico (o que já estava guardado é apagado);
        </li>
        <li>
          <strong>apagar</strong> o histórico ou tirar filmes das listas;
        </li>
        <li>
          <strong>excluir</strong> sua conta e tudo o que está nela.
        </li>
      </ul>
      <p>Nome, e-mail e foto vêm do Google: para corrigir, altere na sua conta Google e entre de novo.</p>

      <h2>Quem é o responsável</h2>
      <p>
        O responsável pelo Catálogo Streaming, um projeto pessoal de estudo, sem fins comerciais. Dúvidas ou pedidos
        sobre seus dados: <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
      </p>

      <p className={styles.aviso}>Última atualização: 23 de novembro de 2026.</p>
      <p>
        <Link href="/" className={styles.voltar}>
          ← Voltar ao catálogo
        </Link>
      </p>
    </article>
  );
}
