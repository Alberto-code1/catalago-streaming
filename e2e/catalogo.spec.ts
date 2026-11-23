import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("grade carrega com pelo menos 20 filmes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("cartao-filme").nth(19)).toBeVisible();
});

test("filtro muda a URL e marca o serviço escolhido", async ({ page }) => {
  await page.goto("/");
  const netflix = page.getByRole("link", { name: "Netflix", exact: true });
  await netflix.click();
  await expect(page).toHaveURL(/servico=netflix/);
  await expect(netflix).toHaveAttribute("aria-current", "page");
});

test("carregar mais adiciona filmes", async ({ page }) => {
  await page.goto("/");
  const cartoes = page.getByTestId("cartao-filme");
  await expect(cartoes.nth(19)).toBeVisible();
  const antes = await cartoes.count();

  await page.getByRole("button", { name: "Carregar mais filmes" }).click();
  await expect.poll(() => cartoes.count()).toBeGreaterThan(antes);
});

test("abre a página do filme", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("cartao-filme").first().click();
  await expect(page).toHaveURL(/\/filme\/\d+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Onde assistir no Brasil")).toBeVisible();
});

test("id inválido mostra 'Filme não encontrado'", async ({ page }) => {
  await page.goto("/filme/abc");
  await expect(page.getByRole("heading", { name: "Filme não encontrado" })).toBeVisible();
});

test("o primeiro Tab mostra o link 'Pular para o conteúdo'", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
});

test("sem problemas graves de acessibilidade", async ({ page }) => {
  for (const caminho of ["/", "/filme/27205", "/sobre"]) {
    await page.goto(caminho);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // O conteúdo de dentro do player do YouTube é do YouTube, não nosso: fica de fora
    const { violations } = await new AxeBuilder({ page }).exclude('iframe[src*="youtube"]').analyze();
    const graves = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(graves.map((v) => `${caminho}: ${v.id}`)).toEqual([]);
  }
});
