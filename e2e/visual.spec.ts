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
