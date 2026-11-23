import { defineConfig, devices } from "@playwright/test";

/**
 * Testes de ponta a ponta: um navegador de verdade abre o site e clica como um usuário.
 * Rodar: npm run test:e2e   (ver o robô trabalhando: npx playwright test --headed)
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Liga o site sozinho se ele ainda não estiver ligado
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
