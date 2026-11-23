import Link from "next/link";

/** Aparece quando o endereço aponta para um filme que não existe. */
export default function FilmeNaoEncontrado() {
  return (
    <div style={{ padding: "60px 0", textAlign: "center" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Filme não encontrado</h1>
      <p style={{ color: "var(--texto-3)", marginBottom: 24 }}>
        Esse filme não existe no catálogo ou o endereço está errado.
      </p>
      <Link href="/" style={{ color: "var(--destaque)", fontWeight: 600 }}>
        ← Voltar ao catálogo
      </Link>
    </div>
  );
}
