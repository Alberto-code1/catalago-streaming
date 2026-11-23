"use client"; // o botão "Sair" roda no navegador

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-cliente";
import { iniciais } from "@/lib/formatar";
import { definirEstado, ESTADO_VAZIO } from "./estadoPessoal";
import { MenuFechavel } from "./MenuFechavel";
import styles from "./AreaConta.module.css";

type Props = { nome: string; foto: string | null };

/** A foto (ou as iniciais) da pessoa, que abre o menu com "Minha conta" e "Sair". */
export function MenuConta({ nome, foto }: Props) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await authClient.signOut();
    definirEstado(ESTADO_VAZIO);
    setSaindo(false);
    router.refresh();
  }

  return (
    <MenuFechavel className={styles.menu}>
      {/* O nome lido pelo leitor de tela inclui o que aparece na tela (as iniciais, quando não há foto) */}
      <summary className={styles.botao} data-testid="menu-conta">
        {foto ? (
          <Image src={foto} alt="" width={32} height={32} className={styles.foto} />
        ) : (
          <span className={styles.iniciais}>{iniciais(nome)}</span>
        )}
        <span className="sr-only">{foto ? `Conta de ${nome}` : `, conta de ${nome}`}</span>
      </summary>
      <div className={styles.lista}>
        <p className={styles.nome}>{nome}</p>
        <Link href="/minha-conta">Minha conta</Link>
        <button type="button" onClick={sair} disabled={saindo}>
          {saindo ? "Saindo…" : "Sair"}
        </button>
      </div>
    </MenuFechavel>
  );
}
