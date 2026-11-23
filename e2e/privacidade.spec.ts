import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { entrarComoTeste } from "./apoio/login";

const FILME = 27205;

/** Abre o filme e espera o registro em "Vistos recentemente" (se houver) terminar. */
async function abrirFilmeEsperando(page: Page) {
  const registrou = page.waitForResponse(
    (r) => r.request().method() === "POST" && r.url().startsWith(`http://localhost:3000/filme/${FILME}`),
  );
  await page.goto(`/filme/${FILME}`);
  await registrou;
}

test("desligar o histórico apaga e para de guardar", async ({ page }) => {
  await entrarComoTeste(page);
  await abrirFilmeEsperando(page);

  await page.goto("/minha-conta?aba=recentes");
  await expect(page.getByTestId("item-lista")).toHaveCount(1);

  const chave = page.getByRole("switch", { name: "Guardar meu histórico" });
  await expect(chave).toHaveAttribute("aria-checked", "true");
  await chave.click();
  await expect(page.getByText("Histórico desligado e apagado.")).toBeVisible();
  await expect(page.getByTestId("item-lista")).toHaveCount(0);

  // Abrir um filme agora não entra no histórico
  await page.goto(`/filme/${FILME}`);
  await expect(page.getByRole("button", { name: "Já assisti", exact: true })).toBeVisible();
  await page.goto("/minha-conta?aba=recentes");
  await expect(page.getByText("Os filmes que você abrir aparecem aqui.")).toBeVisible();
  await expect(page.getByRole("switch", { name: "Guardar meu histórico" })).toHaveAttribute("aria-checked", "false");
});

test("baixar meus dados traz a lista", async ({ page }) => {
  const { email } = await entrarComoTeste(page);
  await abrirFilmeEsperando(page);
  const gravou = page.waitForResponse(
    (r) => r.request().method() === "POST" && r.url().startsWith(`http://localhost:3000/filme/${FILME}`),
  );
  await page.getByRole("button", { name: "+ Quero assistir", exact: true }).click();
  await gravou;

  const resposta = await page.request.get("/api/eu/dados");
  expect(resposta.status()).toBe(200);
  expect(resposta.headers()["content-disposition"]).toContain("meus-dados-catalogo.json");
  const dados = await resposta.json();
  expect(dados.conta.email).toBe(email);
  expect(dados.queroAssistir).toEqual([{ filmeId: FILME, desde: expect.any(String) }]);
  expect(dados.vistosRecentemente).toHaveLength(1);
});

test("baixar dados sem login dá 401", async ({ request }) => {
  const resposta = await request.get("/api/eu/dados");
  expect(resposta.status()).toBe(401);
});

test("excluir a conta apaga tudo e desconecta", async ({ page }) => {
  await entrarComoTeste(page);
  await page.goto("/minha-conta");
  await page.getByRole("button", { name: "Excluir minha conta" }).click();
  const caixa = page.getByRole("dialog", { name: "Excluir minha conta?" });
  await expect(caixa).toBeVisible();
  // Cancelar não exclui
  await caixa.getByRole("button", { name: "Cancelar" }).click();
  await expect(caixa).toBeHidden();

  await page.getByRole("button", { name: "Excluir minha conta" }).click();
  await caixa.getByRole("button", { name: "Excluir para sempre" }).click();
  await expect(page).toHaveURL("http://localhost:3000/");
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();

  // O cookie antigo não vale mais
  await page.goto("/minha-conta");
  await expect(page).toHaveURL(/\/entrar/);
  expect((await page.request.get("/api/eu/dados")).status()).toBe(401);
});

test("privacidade e minha conta sem violações sérias de acessibilidade", async ({ page }) => {
  await page.goto("/privacidade");
  await expect(page.getByRole("heading", { name: "Privacidade", level: 1 })).toBeVisible();
  let r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);

  await entrarComoTeste(page);
  await page.goto("/minha-conta");
  await expect(page.getByRole("heading", { name: "Privacidade e dados" })).toBeVisible();
  r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
