import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página não encontrada" };

/** Aparece quando o endereço digitado não existe no site (erro 404). */
export default function PaginaNaoEncontrada() {
  return (
    <div style={{ padding: "60px 0", textAlign: "center" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Página não encontrada</h1>
      <p style={{ color: "var(--texto-3)", marginBottom: 24 }}>
        Esse endereço não existe. Confira se ele foi digitado certo.
      </p>
      <Link href="/" style={{ color: "var(--destaque)", fontWeight: 600 }}>
        ← Voltar ao catálogo
      </Link>
    </div>
  );
}
