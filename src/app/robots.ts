import type { MetadataRoute } from "next";
import { urlDoSite } from "@/lib/site";

/** Regras para robôs de busca (fica em /robots.txt): pode visitar tudo. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${urlDoSite()}/sitemap.xml`,
  };
}
