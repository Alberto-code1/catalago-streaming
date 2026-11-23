import { expect, test } from "@playwright/test";
import { entrarComoTeste } from "./apoio/login";

test("entrar e sair", async ({ page }) => {
  await entrarComoTeste(page);
  await page.goto("/");
  const conta = page.getByLabel(/^Conta de /);
  await expect(conta).toBeVisible();

  await conta.click();
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
});

test("visitante vê o link Entrar", async ({ page }) => {
  await page.goto("/sobre");
  await expect(page.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar?volta=%2Fsobre");
});
