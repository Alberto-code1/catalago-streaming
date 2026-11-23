import { describe, expect, test } from "vitest";
import sitemap from "@/app/sitemap";
import { urlDoSite } from "@/lib/site";

describe("urlDoSite", () => {
  test("usa o endereço configurado, sem barra no fim", () => {
    expect(urlDoSite({ NEXT_PUBLIC_SITE_URL: "https://meusite.com.br/" })).toBe("https://meusite.com.br");
  });

  test("na Vercel, usa o endereço de produção que ela informa", () => {
    expect(urlDoSite({ VERCEL_PROJECT_PRODUCTION_URL: "catalogo.vercel.app" })).toBe("https://catalogo.vercel.app");
  });

  test("no computador, usa o localhost", () => {
    expect(urlDoSite({})).toBe("http://localhost:3000");
  });
});

describe("sitemap", () => {
  test("lista a página inicial, a Sobre, a Privacidade e uma página por serviço", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(urlDoSite());
    expect(urls).toContain(`${urlDoSite()}/sobre`);
    expect(urls).toContain(`${urlDoSite()}/?servico=netflix`);
    expect(urls).toContain(`${urlDoSite()}/privacidade`);
    expect(urls).toHaveLength(8);
  });
});
