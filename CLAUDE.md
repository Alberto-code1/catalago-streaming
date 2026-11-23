@AGENTS.md

# Catálogo Streaming

Site que mostra os filmes disponíveis agora nos streamings do Brasil, com dados do TMDB.
É um **projeto de estudo**: o dono está aprendendo a usar o Claude Code e a construir sites completos.

- **Site no ar:** https://catalogo-streaming-one.vercel.app (Vercel, publica sozinho a cada push na `main`)
- **Código:** https://github.com/Alberto-code1/catalago-streaming
- Design: [docs/superpowers/specs/2026-11-22-catalogo-streaming-design.md](docs/superpowers/specs/2026-11-22-catalogo-streaming-design.md)
- Plano: [docs/superpowers/plans/2026-11-22-catalogo-streaming.md](docs/superpowers/plans/2026-11-22-catalogo-streaming.md)

## Como trabalhar com o dono

- Ele é iniciante e fala português. Explique cada passo em português simples, sem jargão (ou explique o jargão).
- Trabalhe em etapas pequenas, cada uma com algo para ele ver no navegador.
- Ações em sites externos (TMDB, GitHub, Vercel) são feitas por ele, com instruções passo a passo.

## Regras do projeto

- O token do TMDB (`TMDB_READ_TOKEN`) fica só em `.env.local` e na Vercel. Nunca no Git, nunca em código de cliente.
- Todo arquivo que chama o TMDB começa com `import "server-only";`.
- Lógica pura em `src/lib/` com testes em `tests/`. Telas em `src/components/` e `src/app/`.

## Qualidade (medida em 2026-11-23, site publicado, Lighthouse 12)

| Aparelho | Desempenho | Acessibilidade | Boas práticas | SEO | LCP |
|---|---|---|---|---|---|
| Celular | 91–98 | 100 | 100 | 100 | 2,3 s |
| Computador | 100 | 100 | 100 | 100 | 0,7 s |

O desempenho no celular varia de uma rodada para outra; meça mais de uma vez.
O robô "Qualidade" (GitHub Actions) roda lint, testes, build e testes de ponta a ponta a cada push e pull request.

## Comandos

- `npm run dev`: liga o site em http://localhost:3000
- `npm test`: roda os testes
- `npm run lint`: procura problemas no código
- `npm run test:e2e`: testes de ponta a ponta (ver o robô: `npx.cmd playwright test --headed --workers=1`)
- No PowerShell deste Windows, scripts são bloqueados: use `npm.cmd` / `npx.cmd`.
