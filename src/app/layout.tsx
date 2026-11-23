import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Rodape } from "@/components/Rodape";
import { Topo } from "@/components/Topo";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Catálogo Streaming",
  description: "Descubra os filmes disponíveis agora nos streamings do Brasil.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body>
        <a href="#conteudo" className="pular">
          Pular para o conteúdo
        </a>
        <Topo />
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
        <Rodape />
      </body>
    </html>
  );
}
