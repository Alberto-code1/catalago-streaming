import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Big_Shoulders, Instrument_Sans } from "next/font/google";
import { Rodape } from "@/components/Rodape";
import { Topo } from "@/components/Topo";
import { urlDoSite } from "@/lib/site";
import "./globals.css";

// Títulos: Big Shoulders, alta e estreita, com cara de letreiro de cinema. Texto: Instrument Sans.
const titulo = Big_Shoulders({ variable: "--font-titulo", subsets: ["latin"], axes: ["opsz"] });
const texto = Instrument_Sans({ variable: "--font-texto", subsets: ["latin"] });

const descricao = "Descubra os filmes disponíveis agora na Netflix, Prime Video, Disney+, HBO Max e Globoplay no Brasil.";

/** Título, descrição e dados de compartilhamento usados pelo Google e pelo WhatsApp. */
export const metadata: Metadata = {
  metadataBase: new URL(urlDoSite()),
  title: { default: "Catálogo Streaming", template: "%s · Catálogo Streaming" },
  description: descricao,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Catálogo Streaming",
    title: "Catálogo Streaming",
    description: descricao,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable}`}>
      <body>
        <a href="#conteudo" className="pular">
          Pular para o conteúdo
        </a>
        <Topo />
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
        <Rodape />
        {/* Estatísticas da Vercel: visitas (sem cookies) e velocidade real dos visitantes */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
