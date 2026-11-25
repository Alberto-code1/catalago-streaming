@AGENTS.md

# Catálogo Streaming

Site que mostra os filmes disponíveis agora nos streamings do Brasil, com dados do TMDB.
É um **projeto de estudo**: o dono está aprendendo a usar o Claude Code e a construir sites completos.

- **Site no ar:** https://catalogo-streaming-one.vercel.app (Vercel, publica sozinho a cada push na `main`)
- **Código:** https://github.com/Alberto-code1/catalago-streaming
- Design: [docs/superpowers/specs/2026-11-22-catalogo-streaming-design.md](docs/superpowers/specs/2026-11-22-catalogo-streaming-design.md)
- Plano: [docs/superpowers/plans/2026-11-22-catalogo-streaming.md](docs/superpowers/plans/2026-11-22-catalogo-streaming.md)

## Fases

- **Fase 1 (concluída):** catálogo, filtro por serviço, carregar mais, página do filme, acabamento profissional.
- **Fase 2 (concluída):** filtro por gênero (`?genero=<id do TMDB>`, combina com o serviço) e busca por nome (`/busca?q=`), com selo "✓ serviços" ou "Indisponível" (só os 5 serviços do site contam). Design: [docs/superpowers/specs/2026-11-23-fase2-busca-genero-design.md](docs/superpowers/specs/2026-11-23-fase2-busca-genero-design.md)
- **Fase 3 (concluída, no ar em 2026-11-24):** login só com Google (Better Auth), banco Postgres na Neon (Drizzle), "Quero assistir", "Já assisti" com 👍/👎 e "✓ visto" nos cartões, vistos recentemente, buscas recentes, Minha conta e LGPD (/privacidade, histórico desligável, baixar dados, excluir conta). Design: [docs/superpowers/specs/2026-11-23-fase3-contas-design.md](docs/superpowers/specs/2026-11-23-fase3-contas-design.md) · Plano: [docs/superpowers/plans/2026-11-23-fase3-contas.md](docs/superpowers/plans/2026-11-23-fase3-contas.md)
- **Novo visual (no ar em 2026-11-24):** "parede de pôsteres viva" no topo da home, cor por streaming (body:has([data-tema])), troca "cascata + letreiro", fontes Big Shoulders + Instrument Sans. Design: [docs/superpowers/specs/2026-11-24-visual-parede-design.md](docs/superpowers/specs/2026-11-24-visual-parede-design.md). Lição: efeitos 3D (perspective/backface-visibility) e mix-blend-mode ligados o tempo todo nas 60 capas travavam o celular por segundos; só ligar durante a animação.
- Fluxo desde a Fase 2: trabalhar num ramo, abrir Pull Request (prévia da Vercel + robô "Qualidade") e só então juntar na `main`.

## Agentes

- **Zelador do Catálogo** ([.claude/agents/zelador.md](.claude/agents/zelador.md)): faz uma ronda no site publicado pelo Chrome e só relata (✅/⚠️/❌). Só tem ferramentas do Chrome; não altera nada. Chamar com "chama o Zelador". Design: [docs/superpowers/specs/2026-11-25-zelador-design.md](docs/superpowers/specs/2026-11-25-zelador-design.md)
- **Painel "Meus Agentes"** (https://claude.ai/artifact/ErjFybPv374Cx4LZQy66wh, privado, só leitura): cada agente bate o ponto ao começar e ao terminar na coleção `execucoes` (ferramenta ArtifactData); fichas em `agentes`. Agente novo = nova ficha + instrução de ponto. Design e plano em `C:\Users\alber\Meus Agentes\docs\`.
- Agente novo ou manual alterado só vale depois de recarregar o VS Code (Ctrl+Shift+P → Reload Window).
- Subagentes rodam em segundo plano: os passos não aparecem ao vivo no chat; o que se vê ao vivo é o Chrome. Se o dono estiver logado no site, a ronda pode deixar marcas no histórico dele e não confere o botão de login.

## Como trabalhar com o dono

- Ele é iniciante e fala português. Explique cada passo em português simples, sem jargão (ou explique o jargão).
- Trabalhe em etapas pequenas, cada uma com algo para ele ver no navegador.
- Ações em sites externos (TMDB, GitHub, Vercel) são feitas por ele, com instruções passo a passo.

## Regras do projeto

- O token do TMDB (`TMDB_READ_TOKEN`) fica só em `.env.local` e na Vercel. Nunca no Git, nunca em código de cliente.
- Todo arquivo que chama o TMDB começa com `import "server-only";`.
- Segredos do login e do banco (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`) seguem a mesma regra do token do TMDB. Tabela de variáveis no README.
- Quem é a pessoa vem sempre da sessão no servidor (`obterUsuario`), nunca de um valor enviado pelo navegador. Ler a sessão sempre dentro de `<Suspense>`.
- Banco: Neon `main` = site oficial; ramo `dev` = computador do dono; prévias ganham um ramo próprio. Mudou o `src/db/schema.ts`? `npm run db:gerar` e commitar a migração (o build aplica).
- Lógica pura em `src/lib/` com testes em `tests/`. Telas em `src/components/` e `src/app/`.

## Qualidade (medida em 2026-11-24, site publicado, Lighthouse 12, depois do novo visual)

| Aparelho | Desempenho | Acessibilidade | Boas práticas | SEO | LCP |
|---|---|---|---|---|---|
| Celular | 95–98 | 100 | 100 | 100 | 2,3–2,6 s |
| Computador | 97 | 100 | 100 | 100 | 0,6 s |

O desempenho no celular varia de uma rodada para outra; meça mais de uma vez, com o servidor de desenvolvimento desligado (ele ocupa o processador e distorce a medição). Para comparar versões, meça as duas lado a lado com `--throttling-method=devtools`.
O robô "Qualidade" (GitHub Actions) roda lint, testes, build e testes de ponta a ponta a cada push e pull request.

## Comandos

- `npm run dev`: liga o site em http://localhost:3000
- `npm test`: roda os testes
- `npm run lint`: procura problemas no código
- `npm run test:e2e`: testes de ponta a ponta (ver o robô: `npx.cmd playwright test --headed --workers=1`)
- `npm run db:migrar`: cria/atualiza as tabelas do banco do `.env.local`
- No PowerShell deste Windows, scripts são bloqueados: use `npm.cmd` / `npx.cmd`.
