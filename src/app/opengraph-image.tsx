import { ImageResponse } from "next/og";

/** A imagem que aparece quando alguém compartilha o link do site (WhatsApp, redes sociais). */
export const alt = "Catálogo Streaming: filmes nos streamings do Brasil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagemDeCompartilhamento() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#17131f",
          color: "#e8eaf0",
        }}
      >
        {/* O mesmo símbolo do ícone da aba: quadrado amarelo com um "play" */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 26,
            background: "#ffb547",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64">
            <path d="M18 8 L56 32 L18 56 Z" fill="#17131f" />
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>
          <span>Catálogo</span>
          <span style={{ color: "#ffb547" }}>Streaming</span>
        </div>
        <div style={{ fontSize: 36, color: "#9aa1b2", marginTop: 18 }}>Filmes nos streamings do Brasil</div>
      </div>
    ),
    size,
  );
}
