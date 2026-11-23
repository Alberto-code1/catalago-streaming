import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";

/**
 * Cria uma "pessoa de teste" nova e já deixa o navegador do teste logado com ela.
 * Usa o login por e-mail e senha, que só existe com LOGIN_DE_TESTE=1 (nunca na Vercel):
 * o robô não consegue entrar com uma conta Google de verdade.
 */
export async function entrarComoTeste(page: Page): Promise<{ email: string }> {
  const email = `teste-${randomUUID()}@exemplo.com`;
  const resposta = await page.request.post("/api/auth/sign-up/email", {
    data: { name: "Pessoa de Teste", email, password: `senha-${randomUUID()}` },
    headers: { origin: "http://localhost:3000" },
  });
  expect(resposta.ok(), await resposta.text()).toBeTruthy();
  return { email };
}
