import AxeBuilder from "@axe-core/playwright";
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

test("buscar pelo topo abre os resultados", async ({ page }) => {
  await page.goto("/");
  const caixa = page.getByRole("searchbox", { name: "Buscar filme" });
  await caixa.fill("duna");
  await caixa.press("Enter");
  await expect(page).toHaveURL(/\/busca\?q=duna/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText('Resultados para "duna"');
  await expect(page.getByTestId("cartao-filme").first()).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Buscar filme" })).toHaveValue("duna");
});

test("busca curta pede 2 letras", async ({ page }) => {
  await page.goto("/busca?q=a");
  await expect(page.getByText("Digite pelo menos 2 letras para buscar.")).toBeVisible();
});

test("busca sem resultado", async ({ page }) => {
  await page.goto("/busca?q=zzzxqwv");
  await expect(page.getByText('Nenhum filme encontrado para "zzzxqwv".')).toBeVisible();
});

test("resultados têm selo de disponibilidade", async ({ page }) => {
  await page.goto("/busca?q=duna");
  await expect(page.getByTestId("selo").first()).toHaveText(/^(✓ .+|Indisponível)$/);
});

test("busca com acentos e símbolos", async ({ page }) => {
  await page.goto(`/busca?q=${encodeURIComponent("ação & aventura")}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText('Resultados para "ação & aventura"');
  await expect(page.getByText("Não foi possível carregar os filmes agora.")).toHaveCount(0);
});

test("busca sem problemas graves de acessibilidade", async ({ page }) => {
  await page.goto("/busca?q=duna");
  await expect(page.getByTestId("selo").first()).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).analyze();
  const graves = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(graves.map((v) => v.id)).toEqual([]);
});

test("lista de gêneros fecha com Esc e devolve o foco ao botão", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Gênero ▾").click();
  const comedia = page.getByRole("link", { name: "Comédia", exact: true });
  await expect(comedia).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(comedia).toBeHidden();
  await expect(page.locator("summary")).toBeFocused();
});

test("lista de gêneros fecha ao clicar fora", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Gênero ▾").click();
  const comedia = page.getByRole("link", { name: "Comédia", exact: true });
  await expect(comedia).toBeVisible();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(comedia).toBeHidden();
});

test("só um link marcado como página atual nos filtros", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Gênero ▾").click();
  const filtros = page.getByRole("navigation", { name: "Filtros do catálogo" });
  await expect(filtros.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(filtros.getByRole("link", { name: "Todos os gêneros" })).toHaveAttribute("aria-current", "true");
});

test("lista de gêneros cabe na tela de um celular estreito", async ({ page }) => {
  // 360px: o botão "Gênero" começa uma linha nova, e a lista saía 100px pela esquerda
  for (const endereco of ["/?servico=globoplay", "/?servico=globoplay&genero=10770"]) {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(endereco);
    await page.locator("summary").click();
    const caixa = await page.locator("details ul").boundingBox();
    expect(caixa).not.toBeNull();
    expect(caixa!.x).toBeGreaterThanOrEqual(0);
    expect(caixa!.x + caixa!.width).toBeLessThanOrEqual(360);
  }
});

test("caixa de busca mostra o mesmo texto limpo do título", async ({ page }) => {
  await page.goto(`/busca?q=${encodeURIComponent("  duna    parte  ")}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText('Resultados para "duna parte"');
  await expect(page.getByRole("searchbox", { name: "Buscar filme" })).toHaveValue("duna parte");
});
