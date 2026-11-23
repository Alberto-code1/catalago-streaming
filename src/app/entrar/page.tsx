import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BotaoGoogle } from "@/components/BotaoGoogle";
import { lerVolta } from "@/lib/conta";
import { obterUsuario } from "@/lib/sessao";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false },
};

/** A tela de entrada: /entrar?volta=/filme/123 */
export default function PaginaEntrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <section className={styles.pagina}>
      <h1>Entrar</h1>
      <p className={styles.texto}>
        Entre para guardar os filmes que quer ver, marcar os que já assistiu e encontrar seu histórico em qualquer
        aparelho.
      </p>
      <Suspense fallback={<BotaoGoogle volta="/" />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
      <p className={styles.aviso}>
        Usamos só seu nome, e-mail e foto do Google. Veja a <Link href="/privacidade">política de privacidade</Link>.
      </p>
    </section>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/entrar">, "searchParams">) {
  const params = await searchParams;
  const volta = lerVolta(params.volta);
  // Quem já está logado não precisa desta tela
  if (await obterUsuario()) redirect(volta);
  return (
    <>
      {params.erro && (
        <p className={styles.erro} role="alert">
          Não foi possível entrar com o Google. Tente de novo.
        </p>
      )}
      <BotaoGoogle volta={volta} />
    </>
  );
}
