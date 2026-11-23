import { expect, type Page, test } from "@playwright/test";
import { entrarComoTeste } from "./apoio/login";

// "A Origem" (Inception): um filme conhecido que o TMDB sempre tem
const FILME = 27205;

/** Abre a página do filme logado e espera o registro em "Vistos recentemente" terminar. */
async function abrirFilme(page: Page, filme = FILME) {
  const registrou = page.waitForResponse(
    (r) => r.request().method() === "POST" && r.url().startsWith(`http://localhost:3000/filme/${filme}`),
  );
  await page.goto(`/filme/${filme}`);
  await registrou;
}

/** Clica num botão de lista (nome exato) e espera o nosso servidor confirmar a gravação. */
async function clicarEEsperar(page: Page, nome: string, filme = FILME) {
  const gravou = page.waitForResponse(
    (r) => r.request().method() === "POST" && r.url().startsWith(`http://localhost:3000/filme/${filme}`),
  );
  await page.getByRole("button", { name: nome, exact: true }).click();
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
  await abrirFilme(page);
  await clicarEEsperar(page, "+ Quero assistir");
  await expect(page.getByRole("button", { name: "✓ Na sua lista" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/minha-conta");
  await expect(page.getByTestId("item-lista")).toHaveCount(1);
  await expect(page.getByText("1 filme", { exact: true })).toBeVisible();
});

test("remover da Minha conta tira da lista", async ({ page }) => {
  await entrarComoTeste(page);
  await abrirFilme(page);
  await clicarEEsperar(page, "+ Quero assistir");

  await page.goto("/minha-conta");
  await page.getByRole("button", { name: /^Remover / }).click();
  await expect(page.getByText("Sua lista está vazia.", { exact: false })).toBeVisible();
});

test("cliques rápidos não duplicam", async ({ page }) => {
  await entrarComoTeste(page);
  await abrirFilme(page);
  const botao = page.getByRole("button", { name: /Quero assistir|Na sua lista/ });
  // Conta as gravações que chegam ao nosso servidor, para esperar as 3 terminarem
  let gravacoes = 0;
  page.on("response", (r) => {
    if (r.request().method() === "POST" && r.url().startsWith(`http://localhost:3000/filme/${FILME}`)) gravacoes++;
  });
  await botao.click();
  await botao.click();
  await botao.click();
  await expect.poll(() => gravacoes).toBe(3);

  await page.reload();
  // O botão chega depois do resto da página: espera ele aparecer antes de ler
  await expect(botao).toBeVisible();
  const naLista = (await botao.getAttribute("aria-pressed")) === "true";
  await page.goto("/minha-conta");
  await expect(page.getByTestId("item-lista")).toHaveCount(naLista ? 1 : 0);
});

test("Minha conta sem login manda para entrar", async ({ page }) => {
  await page.goto("/minha-conta");
  await expect(page).toHaveURL(/\/entrar\?volta=%2Fminha-conta$/);
});

test("já assisti tira o filme da lista quero assistir", async ({ page }) => {
  await entrarComoTeste(page);
  await abrirFilme(page);
  await clicarEEsperar(page, "+ Quero assistir");
  await clicarEEsperar(page, "Já assisti");
  await expect(page.getByRole("button", { name: "✓ Assistido" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/minha-conta");
  await expect(page.getByText("Sua lista está vazia.", { exact: false })).toBeVisible();
  await page.goto("/minha-conta?aba=assistidos");
  await expect(page.getByTestId("item-lista")).toHaveCount(1);
});

test("filme assistido mostra ✓ visto no catálogo", async ({ page }) => {
  await entrarComoTeste(page);
  await page.goto("/");
  const primeiro = page.getByTestId("cartao-filme").first();
  await expect(primeiro.getByTestId("marca-visto")).toHaveCount(0);
  const href = await primeiro.getAttribute("href");
  const id = Number(href?.match(/\/filme\/(\d+)/)?.[1]);

  await abrirFilme(page, id);
  await clicarEEsperar(page, "Já assisti", id);

  await page.goto("/");
  await expect(page.locator(`a[href^="/filme/${id}"]`).first().getByTestId("marca-visto")).toBeVisible();
});

test("nota gostei aparece na Minha conta", async ({ page }) => {
  await entrarComoTeste(page);
  await abrirFilme(page);
  await clicarEEsperar(page, "Já assisti");
  await clicarEEsperar(page, "Gostei");
  await expect(page.getByRole("button", { name: "Gostei", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/minha-conta?aba=assistidos");
  await expect(page.getByText("👍 Gostei")).toBeVisible();
});

test("abrir um filme aparece em vistos recentemente", async ({ page }) => {
  await entrarComoTeste(page);
  const registrou = (id: number) =>
    page.waitForResponse((r) => r.request().method() === "POST" && r.url().startsWith(`http://localhost:3000/filme/${id}`));

  let espera = registrou(FILME);
  await page.goto(`/filme/${FILME}`);
  await espera;
  espera = registrou(1726);
  await page.goto("/filme/1726");
  await espera;

  await page.goto("/minha-conta?aba=recentes");
  const itens = page.getByTestId("item-lista");
  await expect(itens).toHaveCount(2);
  // O último aberto aparece primeiro
  await expect(itens.first().locator("a")).toHaveAttribute("href", "/filme/1726");
});

test("busca aparece em buscas recentes", async ({ page }) => {
  await entrarComoTeste(page);
  const registrou = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/busca"));
  await page.goto("/busca?q=duna");
  await registrou;

  await page.goto("/");
  await page.getByRole("searchbox", { name: "Buscar filme" }).focus();
  const recentes = page.getByRole("region", { name: "Buscas recentes" });
  await expect(recentes.getByRole("link", { name: "duna" })).toBeVisible();

  // Esc fecha a lista e mantém o foco no campo
  await page.keyboard.press("Escape");
  await expect(recentes).toHaveCount(0);
  await expect(page.getByRole("searchbox", { name: "Buscar filme" })).toBeFocused();
});

test("apagar todas limpa a lista de buscas recentes", async ({ page }) => {
  await entrarComoTeste(page);
  const registrou = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/busca"));
  await page.goto("/busca?q=matrix");
  await registrou;

  await page.goto("/");
  await page.getByRole("searchbox", { name: "Buscar filme" }).focus();
  await page.getByRole("button", { name: "Apagar todas" }).click();
  await expect(page.getByRole("region", { name: "Buscas recentes" })).toHaveCount(0);

  await page.reload();
  await page.getByRole("searchbox", { name: "Buscar filme" }).focus();
  await expect(page.getByRole("region", { name: "Buscas recentes" })).toHaveCount(0);
});

test("visitante não vê buscas recentes", async ({ page }) => {
  await page.goto("/busca?q=duna");
  await page.getByRole("searchbox", { name: "Buscar filme" }).focus();
  await expect(page.getByRole("region", { name: "Buscas recentes" })).toHaveCount(0);
});
