import { expect, type Page, test } from "@playwright/test";
import { entrarComoTeste } from "./apoio/login";

// "A Origem" (Inception): um filme conhecido que o TMDB sempre tem
const FILME = 27205;

/** Clica num botão de lista e espera o servidor confirmar a gravação. */
async function clicarEEsperar(page: Page, nome: string | RegExp) {
  const gravou = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes(`/filme/${FILME}`));
  await page.getByRole("button", { name: nome }).click();
  await gravou;
}

test("sem login, o botão leva para entrar e volta ao filme", async ({ page }) => {
  await page.goto(`/filme/${FILME}`);
  await expect(page.getByRole("link", { name: "+ Quero assistir" })).toHaveAttribute(
    "href",
    `/entrar?volta=%2Ffilme%2F${FILME}`,
  );
});

test("marcar quero assistir aparece na Minha conta", async ({ page }) => {
  await entrarComoTeste(page);
  await page.goto(`/filme/${FILME}`);
  await clicarEEsperar(page, "+ Quero assistir");
  await expect(page.getByRole("button", { name: "✓ Na sua lista" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/minha-conta");
  await expect(page.getByTestId("item-lista")).toHaveCount(1);
  await expect(page.getByText("1 filme", { exact: true })).toBeVisible();
});

test("remover da Minha conta tira da lista", async ({ page }) => {
  await entrarComoTeste(page);
  await page.goto(`/filme/${FILME}`);
  await clicarEEsperar(page, "+ Quero assistir");

  await page.goto("/minha-conta");
  await page.getByRole("button", { name: /^Remover / }).click();
  await expect(page.getByText("Sua lista está vazia.", { exact: false })).toBeVisible();
});

test("cliques rápidos não duplicam", async ({ page }) => {
  await entrarComoTeste(page);
  await page.goto(`/filme/${FILME}`);
  const botao = page.getByRole("button", { name: /Quero assistir|Na sua lista/ });
  await botao.click();
  await botao.click();
  await botao.click();
  // Espera todas as gravações terminarem
  await page.waitForLoadState("networkidle");

  await page.reload();
  const naLista = (await page.getByRole("button", { name: "✓ Na sua lista" }).count()) === 1;
  await page.goto("/minha-conta");
  await expect(page.getByTestId("item-lista")).toHaveCount(naLista ? 1 : 0);
});

test("Minha conta sem login manda para entrar", async ({ page }) => {
  await page.goto("/minha-conta");
  await expect(page).toHaveURL(/\/entrar\?volta=%2Fminha-conta$/);
});
