import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/** A cor de destaque que o CSS está usando agora na página. */
async function destaque(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--destaque").trim());
}

test("escolher Netflix pinta o site de vermelho", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => destaque(page)).toBe("#ffb547");
  await page.goto("/?servico=netflix");
  await expect.poll(() => destaque(page)).toBe("#e50914");
});

test("a página do filme aberta a partir de um serviço herda a cor dele", async ({ page }) => {
  await page.goto("/filme/27205?servico=prime");
  await expect.poll(() => destaque(page)).toBe("#1fb4ec");
});

/** As capas (endereços únicos) que a parede está mostrando agora. */
async function capasDaParede(page: Page) {
  return page.getByTestId("parede").evaluate((el) =>
    [...new Set([...el.querySelectorAll("img")].map((img) => (img as HTMLImageElement).src))].sort(),
  );
}

/** As capas que a parede deveria mostrar para um serviço (as do catálogo dele, em tamanho pequeno). */
async function capasEsperadas(page: Page, servico: string) {
  const r = await page.request.get(`/api/filmes?servico=${servico}&pagina=1`);
  const { filmes } = (await r.json()) as { filmes: { capa: string | null }[] };
  return [...new Set(filmes.flatMap((f) => (f.capa ? [f.capa.replace("/w342/", "/w154/")] : [])))].sort();
}

test("o topo da página inicial pergunta o que assistir hoje à noite", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("O que assistir hoje à noite");
  await expect(page.getByTestId("parede")).toBeVisible();
});

test("escolher Netflix troca o letreiro e as capas da parede", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Netflix", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("O que assistir na Netflix");
  const esperadas = await capasEsperadas(page, "netflix");
  await expect.poll(() => capasDaParede(page), { timeout: 10_000 }).toEqual(esperadas);
});

test("trocar de serviço rápido duas vezes deixa as capas do último", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Netflix", exact: true }).click();
  await page.getByRole("link", { name: "Disney+", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("O que assistir no Disney+");
  const esperadas = await capasEsperadas(page, "disney");
  await expect.poll(() => capasDaParede(page), { timeout: 10_000 }).toEqual(esperadas);
});

test("com movimento reduzido, a parede fica parada", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const animacao = await page
    .getByTestId("parede")
    .locator("[data-fileira]")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animacao).toBe("none");
});

test("no celular, a página inicial não rola para o lado", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await page.goto("/?servico=max");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("O que assistir na HBO Max");
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});

for (const servico of ["", "netflix", "prime", "disney", "max", "globoplay"]) {
  test(`página inicial ${servico || "todos"} sem problemas sérios de acessibilidade`, async ({ page }) => {
    await page.goto(servico ? `/?servico=${servico}` : "/");
    await expect(page.getByTestId("cartao-filme").first()).toBeVisible();
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
}
