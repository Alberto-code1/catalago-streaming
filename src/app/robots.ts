import type { MetadataRoute } from "next";
import { urlDoSite } from "@/lib/site";

/** Regras para robôs de busca (fica em /robots.txt): pode visitar tudo, menos as páginas pessoais. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/minha-conta", "/entrar"] },
    sitemap: `${urlDoSite()}/sitemap.xml`,
  };
}
