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
