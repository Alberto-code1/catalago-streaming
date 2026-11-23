type Ambiente = Record<string, string | undefined>;

/**
 * O endereço público do site, usado em links de compartilhamento e no sitemap.
 * 1) NEXT_PUBLIC_SITE_URL, se configurado (ex.: um domínio próprio);
 * 2) na Vercel, o endereço de produção que ela informa sozinha;
 * 3) no computador, http://localhost:3000.
 */
export function urlDoSite(env: Ambiente = process.env): string {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
