import { expect, test } from "@playwright/test";

test("escolher um gênero mantém o serviço", async ({ page }) => {
  await page.goto("/?servico=netflix");
  await page.getByText("Gênero ▾").click();
  await page.getByRole("link", { name: "Comédia", exact: true }).click();
  await expect(page).toHaveURL(/servico=netflix/);
  await expect(page).toHaveURL(/genero=35/);
  await expect(page.getByText("Gênero: Comédia ▾")).toBeVisible();
});

test("trocar de serviço mantém o gênero", async ({ page }) => {
  await page.goto("/?genero=35");
  await page.getByRole("link", { name: "Netflix", exact: true }).click();
  await expect(page).toHaveURL(/servico=netflix/);
  await expect(page).toHaveURL(/genero=35/);
});

test("voltar do filme mantém serviço e gênero", async ({ page }) => {
  await page.goto("/?servico=netflix&genero=35");
  await page.getByTestId("cartao-filme").first().click();
  await expect(page).toHaveURL(/\/filme\/\d+/);
  await page.getByRole("link", { name: "← Voltar ao catálogo" }).click();
  await expect(page).toHaveURL(/\/\?servico=netflix&genero=35$/);
});

test("carregar mais respeita o gênero", async ({ page }) => {
  await page.goto("/?genero=35");
  const cartoes = page.getByTestId("cartao-filme");
  await expect(cartoes.nth(19)).toBeVisible();
  const antes = await cartoes.count();

  const pedido = page.waitForRequest((r) => r.url().includes("/api/filmes"));
  await page.getByRole("button", { name: "Carregar mais filmes" }).click();
  expect((await pedido).url()).toContain("genero=35");
  await expect.poll(() => cartoes.count()).toBeGreaterThan(antes);
});
