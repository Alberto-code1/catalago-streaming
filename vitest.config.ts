import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Permite testar arquivos de servidor (a trava só faz sentido no Next.js)
      "server-only": fileURLToPath(new URL("./tests/apoio/server-only.ts", import.meta.url)),
    },
  },
});
