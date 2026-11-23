import type { MetadataRoute } from "next";
import { SERVICOS } from "@/lib/servicos";
import { urlDoSite } from "@/lib/site";

/** A lista de páginas que entregamos ao Google (fica em /sitemap.xml). */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = urlDoSite();
  return [
    { url: site, changeFrequency: "daily", priority: 1 },
    { url: `${site}/sobre`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    ...SERVICOS.map((s) => ({
      url: `${site}/?servico=${s.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
