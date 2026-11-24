# Catálogo Streaming

Site que mostra os filmes disponíveis agora nos streamings do Brasil (dados do TMDB), com contas Google,
listas "Quero assistir" e "Já assisti", histórico e controles de privacidade (LGPD).

No ar: https://catalogo-streaming-one.vercel.app

## Como rodar no computador

1. Instale as dependências: `npm install` (no PowerShell do Windows: `npm.cmd install`).
2. Crie o arquivo `.env.local` com as variáveis abaixo.
3. Crie as tabelas no banco: `npm run db:migrar`.
4. Ligue o site: `npm run dev` e abra http://localhost:3000.

## Variáveis de ambiente (`.env.local` e Vercel — nunca no Git)

| Variável | Para quê | Onde na Vercel |
|---|---|---|
| `TMDB_READ_TOKEN` | dados dos filmes | Production e Preview |
| `DATABASE_URL` | banco Postgres (Neon) | criada pela integração da Neon |
| `BETTER_AUTH_SECRET` | assina os cookies de login (32+ caracteres aleatórios) | Production e Preview, **mesmo valor** |
| `BETTER_AUTH_URL` | endereço do site (`http://localhost:3000` no computador) | só Production |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | login com Google (Google Cloud Console) | Production e Preview |
| `LOGIN_DE_TESTE=1` | "pessoa de teste" para o robô Playwright | **nunca** na Vercel |

No computador, use um ramo próprio do banco na Neon (ex.: `dev`), para não misturar com os dados reais.

## Comandos

- `npm run dev` — liga o site em http://localhost:3000
- `npm test` — testes unitários (Vitest)
- `npm run lint` — procura problemas no código
- `npm run test:e2e` — testes de ponta a ponta (Playwright)
- `npm run db:gerar` — gera uma migração depois de mudar `src/db/schema.ts`
- `npm run db:migrar` — aplica as migrações (o `npm run build` também aplica)
