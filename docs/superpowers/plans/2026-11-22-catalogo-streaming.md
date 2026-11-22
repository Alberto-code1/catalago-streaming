# Catálogo Streaming — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** um site em Next.js que mostra os filmes disponíveis agora nos streamings do Brasil (dados do TMDB), com filtro por serviço, "carregar mais" e uma página por filme com trailer e elenco. Tem acabamento profissional (SEO, acessibilidade, esqueletos de carregamento, estatísticas, testes de ponta a ponta e CI) e é publicado na Vercel a partir do GitHub. Este plano cobre a **Fase 1** do spec.

**Arquitetura:** todas as chamadas ao TMDB rodam no servidor (Server Components e uma rota `/api/filmes`), usando um token guardado em variável de ambiente. A lógica pura (montar parâmetros, escolher trailer, formatar) fica em arquivos pequenos de `src/lib/` com testes Vitest. As telas são componentes pequenos em `src/components/`, estilizados com CSS Modules e baseados na prévia aprovada.

**Tecnologias:** Next.js 16 (App Router, TypeScript, `src/`), CSS Modules, Vitest 5, Playwright com `@axe-core/playwright`, pacote `server-only`, API do TMDB v3, `next/og`, `@vercel/analytics`, `@vercel/speed-insights`, Git, GitHub (pelo site, porque o `gh` não está instalado), GitHub Actions e Vercel.

**Spec:** `docs/superpowers/specs/2026-11-22-catalogo-streaming-design.md`

## Restrições globais

- O dono é **iniciante**. Toda tarefa termina com uma explicação curta em português simples do que foi feito e por quê, e com algo para ver no navegador. Não use jargão sem explicar.
- Interface 100% em português. Dados do TMDB com `language=pt-BR`.
- Região: `watch_region=BR`. Monetização: `with_watch_monetization_types=flatrate|free|ads`.
- O token fica em `TMDB_READ_TOKEN` e é enviado como `Authorization: Bearer <token>`. **Nunca** em código de cliente, **nunca** no Git (`.env*.local` no `.gitignore`).
- Todo arquivo que fala com o TMDB começa com `import "server-only";`.
- Rodapé em todas as páginas: `Dados de filmes: TMDB · Onde assistir: JustWatch`, com link para https://www.themoviedb.org e https://www.justwatch.com.
- Visual: tema escuro da prévia `.superpowers/brainstorm/1908-1795364631/content/telas-v1.html`. Use as cores de lá: fundo `#0b0d12`, superfície `#12151d`, destaque `#f5c518`, texto `#e8eaf0`, texto secundário `#7c8499`.
- Nota com uma casa decimal e ponto, como na prévia (`8.2`). Duração no formato `2h 46min`.
- Cache das chamadas ao TMDB: `next: { revalidate: 21600 }` (6 horas).
- Páginas do discover limitadas a **1–500**.
- Next.js 16: `params` e `searchParams` de páginas são **Promises** (`await`).
- Commits pequenos, com mensagem em português e terminando com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Metas do Lighthouse: Acessibilidade, Boas Práticas e SEO **≥ 90**. Desempenho **≥ 90** no computador e **≥ 80** no celular.
- Testes unitários ficam em `tests/` (Vitest). Testes de ponta a ponta ficam em `e2e/` (Playwright). O Vitest não deve rodar `e2e/`.
- O dono executa as ações em sites externos (TMDB, GitHub, Vercel). Quem implementa dá as instruções passo a passo e espera a confirmação.

## Foco da revisão

1. `?servico=` com valor desconhecido (`?servico=xpto`) → tratar como "Todos", sem erro.
2. `/api/filmes?pagina=abc`, `pagina=0` ou `pagina=9999` → página limitada a 1–500. Acima do total, devolver lista vazia, e o botão "Carregar mais" some.
3. O mesmo filme aparecendo em duas páginas do discover (a popularidade muda entre as chamadas) → não repetir na grade, para não gerar chaves React duplicadas.
4. Filme sem capa, sem fundo ou ator sem foto → bloco com o título ou as iniciais, nunca imagem quebrada.
5. `/filme/abc` ou um id que o TMDB não conhece (404) → página "Filme não encontrado".

Os testes de cada linha estão nas tarefas 3 (1), 5 (2 e 3), 3 e 6 (4) e 6 (5).

---

## Estrutura de arquivos

```
CLAUDE.md                         contexto do projeto para o Claude Code
.env.local                        TMDB_READ_TOKEN (fora do Git)
next.config.ts                    libera imagens de image.tmdb.org
vitest.config.ts                  configuração dos testes
scripts/listar-servicos.mjs       confere os IDs dos serviços no Brasil
src/lib/tipos.ts                  tipos compartilhados
src/lib/servicos.ts               lista dos 5 serviços + busca por slug
src/lib/formatar.ts               nota, duração, ano, URL de imagem, iniciais
src/lib/discover.ts               parâmetros do discover, ler página, juntar sem repetir
src/lib/filme.ts                  escolher trailer, extrair "onde assistir"
src/lib/tmdb.ts                   (server-only) tmdbFetch, buscarFilmes, buscarDetalhes
src/app/layout.tsx, globals.css   layout, tema e rodapé
src/app/page.tsx                  página inicial
src/app/api/filmes/route.ts       rota para "carregar mais"
src/app/filme/[id]/page.tsx       página do filme
src/app/filme/[id]/not-found.tsx  filme não encontrado
src/app/error.tsx                 erro amigável
src/app/loading.tsx, src/app/filme/[id]/loading.tsx   esqueletos de carregamento
src/app/sobre/page.tsx            página Sobre
src/app/sitemap.ts, robots.ts     SEO
src/app/opengraph-image.tsx       imagem de compartilhamento padrão
src/app/icon.svg                  ícone da aba
src/lib/site.ts                   URL pública do site
src/components/*.tsx + *.module.css
tests/*.test.ts                   testes unitários (Vitest)
e2e/*.spec.ts                     testes de ponta a ponta (Playwright)
playwright.config.ts
.github/workflows/ci.yml          robô de qualidade
```

## Tipos (`src/lib/tipos.ts`, definidos na Tarefa 2)

```ts
export type Servico = { slug: string; nome: string; providerId: number; cor: string };
export type FilmeResumo = { id: number; titulo: string; ano: string; nota: number; capa: string | null };
export type PaginaFilmes = { filmes: FilmeResumo[]; pagina: number; totalPaginas: number };
export type Provedor = { id: number; nome: string; logo: string | null };
export type Ator = { id: number; nome: string; personagem: string; foto: string | null };
export type DetalheFilme = {
  id: number; titulo: string; ano: string; nota: number; duracaoMin: number | null;
  generos: string[]; sinopse: string; capa: string | null; fundo: string | null;
  ondeAssistir: Provedor[]; trailerKey: string | null; elenco: Ator[];
};
// Formatos crus do TMDB usados pelas funções puras:
export type TmdbVideo = { key: string; site: string; type: string; iso_639_1: string; official?: boolean };
export type TmdbProvedoresBR = { flatrate?: TmdbProv[]; free?: TmdbProv[]; ads?: TmdbProv[] };
export type TmdbProv = { provider_id: number; provider_name: string; logo_path: string | null };
```

---

### Task 1: Criar o projeto, salvar no Git e enviar ao GitHub

**Arquivos:**
- Criar: tudo o que o `create-next-app` gera, `vitest.config.ts`, `tests/sanidade.test.ts` e `CLAUDE.md`
- Modificar: `.gitignore` e `package.json` (script `test`)

**Interfaces:**
- Produz: `npm run dev` (site em http://localhost:3000) e `npm test` (Vitest).

- [ ] **Passo 1: Desligar o servidor da prévia e tirar `.superpowers/` do caminho.** O `create-next-app` recusa pastas com arquivos desconhecidos (`docs/` é permitido). Pare o servidor de mockups com `bash <pasta do skill brainstorming>/scripts/stop-server.sh ".superpowers/brainstorm/1908-1795364631"` e mova `.superpowers/` temporariamente para a pasta de rascunho da sessão.
- [ ] **Passo 2: Criar o projeto na pasta atual**

Rode: `npx create-next-app@latest . --ts --eslint --app --src-dir --no-tailwind --import-alias "@/*" --use-npm --yes`
Esperado: termina com "Success!". Depois, devolva `.superpowers/` para a raiz.

- [ ] **Passo 3: Ver funcionando.** Rode `npm run dev` em segundo plano e peça ao dono para abrir http://localhost:3000. Esperado: a página padrão do Next.js.
- [ ] **Passo 4: Instalar o Vitest e o `server-only`.** Rode `npm i server-only` e `npm i -D vitest@5`. Crie `vitest.config.ts` com `environment: "node"` e o alias `@` → `./src`. Adicione `"test": "vitest run"` ao `package.json`. Crie `tests/sanidade.test.ts` com `expect(1 + 1).toBe(2)`.
- [ ] **Passo 5: Rodar os testes.** Rode `npm test`. Esperado: 1 teste passando.
- [ ] **Passo 6: Ajustar o `.gitignore`.** Confirme que `.env*.local` está lá (o `create-next-app` costuma incluir) e adicione `.superpowers/`.
- [ ] **Passo 7: Criar o `CLAUDE.md`** com: o que é o projeto (link para o spec e o plano), o dono iniciante que fala português, a regra de explicar cada passo em português simples, a regra do token só no servidor e os comandos `npm run dev` e `npm test`.
- [ ] **Passo 8: Primeiro commit.** O `create-next-app` já roda `git init`. Rode `git add -A` e `git commit -m "Cria projeto Next.js, testes e documentos de design"`. Confira com `git status` que o `.env.local` não existe ou não foi incluído.
- [ ] **Passo 9: Enviar ao GitHub (ação do dono).** Guie o dono a criar um repositório **vazio** em https://github.com/new chamado `catalogo-streaming`, sem README e com visibilidade à escolha dele. Depois rode `git remote add origin <url>`, `git branch -M main` e `git push -u origin main`. Se pedir login, o Git Credential Manager abre o navegador. Esperado: os arquivos aparecem no GitHub.
- [ ] **Passo 10: Explicar ao dono** o que é cada pasta principal (`src/app`, `src/components`, `src/lib`, `tests`), o que é um commit e o que é um push.

---

### Task 2: Chave do TMDB, cliente seguro e lista de serviços

**Arquivos:**
- Criar: `.env.local`, `src/lib/tipos.ts`, `src/lib/tmdb.ts` (só `tmdbFetch` por enquanto), `src/lib/servicos.ts`, `scripts/listar-servicos.mjs`, `tests/servicos.test.ts`

**Interfaces:**
- Produz: todos os tipos da seção "Tipos"; `tmdbFetch<T>(caminho: string, params?: Record<string, string | number>): Promise<T>` (lança `TmdbErro` com `.status: number`); `SERVICOS: Servico[]`; `servicoPorSlug(slug: string | null | undefined): Servico | undefined`; `idsDeTodos(): string`.

- [ ] **Passo 1: Conta e token (ação do dono).** Guie: criar conta em https://www.themoviedb.org/signup, ir em Configurações → API, pedir uma chave de uso pessoal e copiar o **API Read Access Token**. Explique por que o token nunca vai para o chat público nem para o Git. O dono cola o token no `.env.local` como `TMDB_READ_TOKEN=...`. Quem implementa cria o arquivo, mas não lê nem imprime o valor.
- [ ] **Passo 2: Conferir os IDs dos serviços.** Crie `scripts/listar-servicos.mjs`. Ele lê `.env.local` (`node --env-file=.env.local`), chama `GET https://api.themoviedb.org/3/watch/providers/movie?watch_region=BR&language=pt-BR` e imprime `provider_id`, `provider_name` e `display_priorities.BR` dos serviços cujo nome contém Netflix, Prime, Disney, Max ou Globoplay. Rode: `node --env-file=.env.local scripts/listar-servicos.mjs`. Esperado: uma lista de IDs. Valores prováveis: Netflix 8, Amazon Prime Video 119, Disney Plus 337, Max 1899, Globoplay 307. Se a Max tiver dois IDs, use o que aparece com prioridade em BR.
- [ ] **Passo 3: Escrever o teste que falha** em `tests/servicos.test.ts`:

```ts
expect(SERVICOS.map(s => s.slug)).toEqual(["netflix", "prime", "disney", "max", "globoplay"]);
expect(servicoPorSlug("netflix")?.nome).toBe("Netflix");
expect(servicoPorSlug("xpto")).toBeUndefined();
expect(servicoPorSlug(null)).toBeUndefined();
expect(idsDeTodos()).toBe(SERVICOS.map(s => s.providerId).join("|"));
```

- [ ] **Passo 4: Rodar e ver falhar.** Rode `npm test`. Esperado: FALHA (módulo não existe).
- [ ] **Passo 5: Implementar `src/lib/servicos.ts` e `src/lib/tipos.ts`.** Use os nomes "Netflix", "Prime Video", "Disney+", "Max" e "Globoplay", os IDs confirmados no passo 2 e as cores da prévia (`#e50914`, `#00a8e1`, `#113ccf`, `#5822b4`, `#ff3d00`).
- [ ] **Passo 6: Implementar `tmdbFetch` em `src/lib/tmdb.ts`.** O arquivo começa com `import "server-only"`. A base é `https://api.themoviedb.org/3`, com o cabeçalho Bearer de `process.env.TMDB_READ_TOKEN` e `next: { revalidate: 21600 }`. Se a resposta não vier `ok`, lance `class TmdbErro extends Error { status: number }`. Se faltar o token, lance `TmdbErro` com status 500 e a mensagem "TMDB_READ_TOKEN não configurado".
- [ ] **Passo 7: Rodar os testes.** Rode `npm test`. Esperado: tudo passando.
- [ ] **Passo 8: Commit.** Rode `git add` com os arquivos novos (o `.env.local` fica de fora) e `git commit -m "Adiciona cliente do TMDB e lista de serviços"`. Depois rode `git push`.
- [ ] **Passo 9: Explicar ao dono** o que é uma variável de ambiente, por que existe o `server-only` e o que o teste verifica.

---

### Task 3: Grade de filmes populares na página inicial

**Arquivos:**
- Criar: `src/lib/formatar.ts`, `src/lib/discover.ts` (só `montarParametrosDiscover`), `src/components/CartaoFilme.tsx` e `.module.css`, `src/components/GradeFilmes.tsx` e `.module.css`, `src/components/Rodape.tsx`, `tests/formatar.test.ts`, `tests/discover.test.ts`
- Modificar: `src/lib/tmdb.ts` (adicionar `buscarFilmes`), `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `next.config.ts`

**Interfaces:**
- Consome: `tmdbFetch` e `servicoPorSlug` e `idsDeTodos` da Tarefa 2.
- Produz: `formatarNota(n: number): string`; `formatarDuracao(min: number | null): string | null`; `extrairAno(data: string | undefined): string`; `urlImagem(caminho: string | null, tamanho: "w92" | "w185" | "w342" | "w780" | "w1280"): string | null`; `iniciais(nome: string): string`; `montarParametrosDiscover(slug: string | null | undefined, pagina: number): Record<string, string>`; `buscarFilmes(slug: string | null | undefined, pagina: number): Promise<PaginaFilmes>`; `<CartaoFilme filme={FilmeResumo} servico={Servico | undefined} />`; `<GradeFilmes filmes={FilmeResumo[]} servico={Servico | undefined} />`.

- [ ] **Passo 1: Escrever os testes que falham.** Em `tests/formatar.test.ts`:

```ts
expect(formatarNota(8.234)).toBe("8.2");
expect(formatarNota(0)).toBe("0.0");
expect(formatarDuracao(166)).toBe("2h 46min");
expect(formatarDuracao(45)).toBe("45min");
expect(formatarDuracao(120)).toBe("2h");
expect(formatarDuracao(null)).toBeNull();
expect(formatarDuracao(0)).toBeNull();
expect(extrairAno("2024-02-27")).toBe("2024");
expect(extrairAno("")).toBe("");
expect(extrairAno(undefined)).toBe("");
expect(urlImagem("/abc.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/abc.jpg");
expect(urlImagem(null, "w342")).toBeNull();
expect(iniciais("Timothée Chalamet")).toBe("TC");
expect(iniciais("Zendaya")).toBe("Z");
expect(iniciais("Ana Maria Braga")).toBe("AB"); // primeira + última
```

Em `tests/discover.test.ts`:

```ts
const base = { watch_region: "BR", with_watch_monetization_types: "flatrate|free|ads",
  sort_by: "popularity.desc", language: "pt-BR" };
expect(montarParametrosDiscover("netflix", 1)).toEqual({ ...base, page: "1", with_watch_providers: "8" /* id confirmado */ });
expect(montarParametrosDiscover(undefined, 2)).toEqual({ ...base, page: "2", with_watch_providers: idsDeTodos() });
expect(montarParametrosDiscover("xpto", 1).with_watch_providers).toBe(idsDeTodos()); // Foco da revisão 1
```

- [ ] **Passo 2: Rodar e ver falhar.** Rode `npm test`. Esperado: FALHA.
- [ ] **Passo 3: Implementar `src/lib/formatar.ts` e `montarParametrosDiscover` em `src/lib/discover.ts`.** Esses dois arquivos **não** importam o `tmdb.ts`.
- [ ] **Passo 4: Rodar os testes.** Rode `npm test`. Esperado: tudo passando.
- [ ] **Passo 5: Implementar `buscarFilmes` em `src/lib/tmdb.ts`.** Chama `/discover/movie` com `montarParametrosDiscover` e converte cada resultado em `FilmeResumo`, com a capa vinda de `urlImagem(poster_path, "w342")`. O `totalPaginas` é `Math.min(total_pages, 500)`.
- [ ] **Passo 6: Liberar as imagens do TMDB.** Em `next.config.ts`, adicione `images.remotePatterns` com `{ protocol: "https", hostname: "image.tmdb.org" }`.
- [ ] **Passo 7: Montar a tela.** Substitua o tema padrão do `globals.css` pelas cores da prévia. O `layout.tsx` ganha `lang="pt-BR"`, o título "Catálogo Streaming", um topo com o logo "🎬 Catálogo**Streaming**" e o `<Rodape />`. O `CartaoFilme` é um link para `/filme/{id}` e mostra a capa com `next/image`, a nota no canto, o título e o ano. Se não houver capa, mostra um bloco com degradê e o título (Foco da revisão 4). O selo do serviço aparece só quando a prop `servico` existe. A `GradeFilmes` usa `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))`. O `page.tsx` é async e chama `buscarFilmes(undefined, 1)`, com o título "Populares agora" e o subtítulo "disponíveis no Brasil, inclusos na assinatura ou grátis".
- [ ] **Passo 8: Ver no navegador.** Peça ao dono para abrir http://localhost:3000. Esperado: 20 capas reais em grade, no tema escuro, com o rodapé de créditos. Confira também numa janela estreita (modo celular do navegador).
- [ ] **Passo 9: Commit e push.** Rode `git commit -m "Mostra grade de filmes populares nos streamings"` e `git push`.
- [ ] **Passo 10: Explicar ao dono** o que é um Server Component e por que o token não aparece no navegador. Mostre isso na prática: abra o DevTools → Rede e mostre que não há chamada direta ao TMDB.

---

### Task 4: Filtro por serviço

**Arquivos:**
- Criar: `src/components/FiltroServicos.tsx` e `.module.css`
- Modificar: `src/app/page.tsx`

**Interfaces:**
- Consome: `SERVICOS`, `servicoPorSlug` e `buscarFilmes`.
- Produz: `<FiltroServicos ativo={string | undefined} />`, que monta os links `/` e `/?servico=<slug>`.

- [ ] **Passo 1: Implementar o `FiltroServicos`.** São links (não botões com JavaScript), para o filtro ficar na URL. Mostra "Todos" e depois os 5 serviços na ordem de `SERVICOS`. O ativo fica em destaque com `#f5c518`. Um `slug` desconhecido deixa "Todos" ativo.
- [ ] **Passo 2: Ligar na página.** O `page.tsx` lê `(await searchParams).servico`, calcula `servico = servicoPorSlug(...)` e chama `buscarFilmes(servico?.slug, 1)`. A grade recebe `servico`.
- [ ] **Passo 3: Ver no navegador.** Clique em cada serviço. Esperado: a URL muda, a grade muda e os cartões mostram o selo do serviço. O botão Voltar do navegador desfaz o filtro. Abra `/?servico=xpto`. Esperado: igual a "Todos".
- [ ] **Passo 4: Rodar os testes.** Rode `npm test`. Esperado: tudo passando.
- [ ] **Passo 5: Commit e push.** Rode `git commit -m "Adiciona filtro por serviço de streaming"` e `git push`.
- [ ] **Passo 6: Explicar ao dono** por que o filtro mora na URL (dá para compartilhar o link e o Voltar funciona).

---

### Task 5: Carregar mais filmes

**Arquivos:**
- Criar: `src/app/api/filmes/route.ts`, `src/components/CarregarMais.tsx` e `.module.css`
- Modificar: `src/lib/discover.ts` (adicionar `lerPagina` e `juntarSemRepetir`), `tests/discover.test.ts`, `src/app/page.tsx`

**Interfaces:**
- Consome: `buscarFilmes` e `GradeFilmes`.
- Produz: `lerPagina(valor: string | null): number`; `juntarSemRepetir(atuais: FilmeResumo[], novos: FilmeResumo[]): FilmeResumo[]`; `GET /api/filmes?servico=<slug>&pagina=<n>` → JSON `PaginaFilmes`; `<CarregarMais servico={string | undefined} paginaInicial={number} totalPaginas={number} idsIniciais={number[]} />` (client component, `"use client"`).

- [ ] **Passo 1: Escrever os testes que falham** em `tests/discover.test.ts` (Foco da revisão 2 e 3):

```ts
expect(lerPagina("3")).toBe(3);
expect(lerPagina(null)).toBe(1);
expect(lerPagina("abc")).toBe(1);
expect(lerPagina("0")).toBe(1);
expect(lerPagina("-5")).toBe(1);
expect(lerPagina("9999")).toBe(500);
expect(lerPagina("2.7")).toBe(2);
const a = { id: 1, titulo: "A", ano: "2020", nota: 7, capa: null };
const b = { id: 2, titulo: "B", ano: "2021", nota: 6, capa: null };
expect(juntarSemRepetir([a], [a, b])).toEqual([a, b]);
expect(juntarSemRepetir([], [b, b])).toEqual([b]);
```

- [ ] **Passo 2: Rodar e ver falhar.** Rode `npm test`. Esperado: FALHA.
- [ ] **Passo 3: Implementar `lerPagina` e `juntarSemRepetir`.** O `juntarSemRepetir` preserva a ordem: primeiro os atuais, depois os novos que ainda não apareceram.
- [ ] **Passo 4: Rodar os testes.** Rode `npm test`. Esperado: tudo passando.
- [ ] **Passo 5: Implementar a rota.** Ela lê `servico` e `pagina` (via `lerPagina`). Se `pagina` passar do `totalPaginas` da busca, devolve `{ filmes: [], pagina, totalPaginas }`. Em caso de `TmdbErro`, responde `{ erro: "Não foi possível carregar os filmes agora. Tente de novo em instantes." }` com status 502.
- [ ] **Passo 6: Implementar o `CarregarMais`.** Mostra o botão "Carregar mais filmes". Ao clicar, busca `/api/filmes?servico=…&pagina=atual+1` e renderiza os filmes novos (usando `juntarSemRepetir` e excluindo também os ids da primeira página, recebidos por prop `idsIniciais: number[]`). Enquanto carrega, o texto vira "Carregando…" e o botão fica desabilitado. O botão some quando `pagina >= totalPaginas`. Em caso de erro, mostra a mensagem da rota. O componente recebe `key={servico ?? "todos"}`, para zerar ao trocar de filtro.
- [ ] **Passo 7: Ver no navegador.** Clique em "Carregar mais" 3 vezes. Esperado: mais 20 filmes por clique, sem repetidos. Troque o filtro e confira que a lista recomeça.
- [ ] **Passo 8: Commit e push.** Rode `git commit -m "Adiciona botão de carregar mais filmes"` e `git push`.
- [ ] **Passo 9: Explicar ao dono** a diferença entre componente de servidor e de cliente, e por que o botão chama a rota do próprio site em vez de chamar o TMDB.

---

### Task 6: Página do filme

**Arquivos:**
- Criar: `src/lib/filme.ts`, `tests/filme.test.ts`, `src/app/filme/[id]/page.tsx` e `.module.css`, `src/app/filme/[id]/not-found.tsx`, `src/components/Trailer.tsx`, `src/components/Elenco.tsx` e `.module.css`
- Modificar: `src/lib/tmdb.ts` (adicionar `buscarDetalhes`)

**Interfaces:**
- Consome: `tmdbFetch`, `TmdbErro`, `urlImagem`, `formatarNota`, `formatarDuracao`, `extrairAno` e `iniciais`.
- Produz: `escolherTrailer(videos: TmdbVideo[]): string | null` (retorna a `key` do YouTube); `extrairOndeAssistir(br: TmdbProvedoresBR | undefined): Provedor[]`; `buscarDetalhes(id: number): Promise<DetalheFilme | null>`.

- [ ] **Passo 1: Escrever os testes que falham** em `tests/filme.test.ts`:

```ts
const v = (key: string, lang: string, type = "Trailer", site = "YouTube") => ({ key, iso_639_1: lang, type, site });
expect(escolherTrailer([v("en1", "en"), v("pt1", "pt")])).toBe("pt1");
expect(escolherTrailer([v("en1", "en"), v("t1", "pt", "Teaser")])).toBe("en1");
expect(escolherTrailer([v("vim", "pt", "Trailer", "Vimeo")])).toBeNull();
expect(escolherTrailer([])).toBeNull();
const p = (id: number, nome: string) => ({ provider_id: id, provider_name: nome, logo_path: "/l.png" });
expect(extrairOndeAssistir({ flatrate: [p(1899, "Max")], ads: [p(1, "Pluto")], free: [p(1899, "Max")] }).map(x => x.nome))
  .toEqual(["Max", "Pluto"]); // sem repetir, ordem flatrate → free → ads
expect(extrairOndeAssistir(undefined)).toEqual([]);
expect(extrairOndeAssistir({ flatrate: [p(8, "Netflix")] })[0].logo).toBe("https://image.tmdb.org/t/p/w92/l.png");
```

- [ ] **Passo 2: Rodar e ver falhar.** Rode `npm test`. Esperado: FALHA.
- [ ] **Passo 3: Implementar `src/lib/filme.ts`.** A ordem do trailer é: YouTube + Trailer + `pt` → YouTube + Trailer + `en` → `null`. Em cada idioma, prefira `official: true`.
- [ ] **Passo 4: Rodar os testes.** Rode `npm test`. Esperado: tudo passando.
- [ ] **Passo 5: Implementar `buscarDetalhes`.** Uma chamada: `/movie/{id}` com `language=pt-BR`, `append_to_response=videos,credits,watch/providers` e `include_video_language=pt,en`. Se a sinopse vier vazia, faz uma segunda chamada `/movie/{id}?language=en-US` e usa o `overview` dela. O elenco são os 10 primeiros de `credits.cast`, com a foto de `urlImagem(profile_path, "w185")`. O "onde assistir" vem de `extrairOndeAssistir(json["watch/providers"].results.BR)`. Um `TmdbErro` com status 404 devolve `null`. Qualquer outro erro é relançado.
- [ ] **Passo 6: Implementar a página.** Ela faz `const { id } = await params`. Se `id` não for um inteiro positivo, ou se `buscarDetalhes` devolver `null`, chama `notFound()` (Foco da revisão 5). O layout segue a Tela 2 da prévia: topo com o fundo (`w1280`) sob um degradê (só o degradê se não houver fundo), link "← Voltar ao catálogo" para `/`, capa, título e ano, nota, duração, gêneros, sinopse e "Onde assistir no Brasil" com os logos. Se a lista estiver vazia, mostra "Sem streaming no Brasil no momento". O `<Trailer key>` é um `iframe` de `https://www.youtube-nocookie.com/embed/{key}` em 16:9 e só aparece se houver key. O `<Elenco>` mostra a foto redonda ou as `iniciais` (Foco da revisão 4), o nome e o personagem, com rolagem horizontal. Use `generateMetadata` para o título da aba: "{titulo} · Catálogo Streaming".
- [ ] **Passo 7: Implementar o `not-found.tsx`** com "Filme não encontrado" e o link "← Voltar ao catálogo".
- [ ] **Passo 8: Ver no navegador.** Clique num filme popular. Esperado: a página completa, o trailer tocando e o elenco com fotos. Abra `/filme/abc` e `/filme/999999999`. Esperado: "Filme não encontrado".
- [ ] **Passo 9: Commit e push.** Rode `git commit -m "Adiciona página do filme com trailer e elenco"` e `git push`.
- [ ] **Passo 10: Explicar ao dono** o que são rotas dinâmicas (`[id]`) e o `append_to_response` (uma chamada em vez de quatro).

---

### Task 7: Erros e casos vazios

**Arquivos:**
- Criar: `src/app/error.tsx`
- Modificar: `src/app/page.tsx`

**Interfaces:**
- Consome: `buscarFilmes` e `TmdbErro`.

- [ ] **Passo 1: Implementar o `error.tsx`** (client component). Mostra "Não foi possível carregar os filmes agora. Tente de novo em instantes." e um botão "Tentar de novo" que chama `reset()`.
- [ ] **Passo 2: Lista vazia na página inicial.** Se `buscarFilmes` voltar com `filmes.length === 0`, mostra "Nenhum filme encontrado para este serviço." e esconde o `CarregarMais`.
- [ ] **Passo 3: Ver o erro de propósito.** Troque por um momento o `TMDB_READ_TOKEN` do `.env.local` por `errado` e reinicie o `npm run dev`. Esperado: a mensagem amigável e o botão, sem tela vermelha de erro. **Restaure o token** e confira que o site volta ao normal.
- [ ] **Passo 4: Rodar os testes e o lint.** Rode `npm test` e `npm run lint`. Esperado: tudo passando e sem erros de lint.
- [ ] **Passo 5: Commit e push.** Rode `git commit -m "Adiciona mensagens amigáveis de erro e lista vazia"` e `git push`.
- [ ] **Passo 6: Explicar ao dono** por que um site real precisa prever falhas.

---

### Task 8: Carregamento e acessibilidade

**Arquivos:**
- Criar: `src/components/Esqueleto.tsx` e `.module.css`, `src/app/loading.tsx`, `src/app/filme/[id]/loading.tsx`
- Modificar: `src/app/layout.tsx`, `src/app/globals.css`, `FiltroServicos.tsx`, `CartaoFilme.tsx`, `Trailer.tsx`, `Elenco.tsx` e `CarregarMais.tsx`

**Interfaces:**
- Produz: `<EsqueletoGrade quantidade={number} />` e `<EsqueletoFilme />`; o `<main id="conteudo">` no layout.

- [ ] **Passo 1: Esqueletos.** São blocos `#1a1e29` com brilho animado, no formato dos cartões (2:3) e da Tela 2. Com `prefers-reduced-motion: reduce`, ficam sem animação. O `src/app/loading.tsx` mostra o topo dos filtros e `<EsqueletoGrade quantidade={20} />`. O da página do filme mostra `<EsqueletoFilme />`. Enquanto o "carregar mais" busca, aparecem 20 cartões-esqueleto abaixo da grade.
- [ ] **Passo 2: Acessibilidade.** Primeiro item do `body`: link "Pular para o conteúdo" → `#conteudo`, visível só ao receber foco. O `:focus-visible` ganha contorno `2px solid #f5c518` em links e botões. O filtro ativo recebe `aria-current="page"`. A capa tem `alt="Capa de {titulo}"`. A nota tem um texto para leitor de tela: "Nota 8.2 de 10". O iframe recebe `title="Trailer de {titulo}"`. A foto do ator tem `alt="{nome}"`. O botão "Carregar mais" usa `aria-busy` enquanto carrega, e os filmes novos chegam numa região `aria-live="polite"`. Confira que o texto secundário `#7c8499` sobre `#12151d` tem contraste ≥ 4.5:1. Se não tiver, clareie até passar.
- [ ] **Passo 3: Ver no navegador.** No DevTools → Rede, use "3G lento" e recarregue. Esperado: os esqueletos aparecem antes das capas. Depois navegue só com Tab e Enter: pular para o conteúdo, escolher um filtro, abrir um filme e voltar.
- [ ] **Passo 4: Lighthouse local.** Rode `npm run build` e `npm run start`, e no Chrome use DevTools → Lighthouse → Acessibilidade. Esperado: ≥ 90. Corrija o que ele apontar.
- [ ] **Passo 5: Rodar os testes e o lint.** Rode `npm test` e `npm run lint`. Esperado: tudo passando.
- [ ] **Passo 6: Commit e push.** Rode `git commit -m "Adiciona esqueletos de carregamento e melhorias de acessibilidade"` e `git push`.
- [ ] **Passo 7: Explicar ao dono** o que é acessibilidade, quem se beneficia (inclusive o Google) e o que é o Lighthouse.

---

### Task 9: SEO, compartilhamento e identidade

**Arquivos:**
- Criar: `src/lib/site.ts`, `tests/site.test.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/app/icon.svg`, `src/app/sobre/page.tsx` e `.module.css`
- Modificar: `src/app/layout.tsx` (metadata, link "Sobre"), `src/app/filme/[id]/page.tsx` (`generateMetadata` com Open Graph)

**Interfaces:**
- Produz: `urlDoSite(env?: Record<string, string | undefined>): string`; `sitemap(): MetadataRoute.Sitemap`.

- [ ] **Passo 1: Escrever os testes que falham** em `tests/site.test.ts`:

```ts
expect(urlDoSite({ NEXT_PUBLIC_SITE_URL: "https://meusite.com.br/" })).toBe("https://meusite.com.br"); // sem barra no fim
expect(urlDoSite({ VERCEL_PROJECT_PRODUCTION_URL: "catalogo.vercel.app" })).toBe("https://catalogo.vercel.app");
expect(urlDoSite({})).toBe("http://localhost:3000");
const urls = sitemap().map(e => e.url);
expect(urls).toContain(urlDoSite());
expect(urls).toContain(`${urlDoSite()}/sobre`);
expect(urls).toContain(`${urlDoSite()}/?servico=netflix`);
```

- [ ] **Passo 2: Rodar e ver falhar.** Rode `npm test`. Esperado: FALHA.
- [ ] **Passo 3: Implementar `site.ts` e `sitemap.ts`.** O `urlDoSite` usa por padrão `process.env`. O sitemap inclui a página inicial, `/sobre` e uma página por serviço de `SERVICOS`.
- [ ] **Passo 4: Rodar os testes.** Rode `npm test`. Esperado: tudo passando.
- [ ] **Passo 5: Metadata.** No `layout.tsx`, use `metadataBase: new URL(urlDoSite())`, título `{ default: "Catálogo Streaming", template: "%s · Catálogo Streaming" }` e a descrição "Descubra os filmes disponíveis agora na Netflix, Prime Video, Disney+, Max e Globoplay no Brasil.". O Open Graph leva `locale: "pt_BR"` e `type: "website"`. Na página do filme, o `generateMetadata` usa o título do filme, os primeiros 160 caracteres da sinopse e a imagem `urlImagem(fundo ?? capa, "w1280")`. O `robots.ts` libera tudo e aponta para `${urlDoSite()}/sitemap.xml`.
- [ ] **Passo 6: Imagem padrão e ícone.** O `opengraph-image.tsx` usa `ImageResponse` de `next/og`, em 1200×630, com fundo `#0b0d12`, "🎬 Catálogo**Streaming**" com "Streaming" em `#f5c518` e a frase "Filmes nos streamings do Brasil". O `icon.svg` é um quadrado arredondado `#f5c518` com um símbolo de play `#0b0d12`.
- [ ] **Passo 7: Página Sobre.** Explica o que é o site, que os dados vêm do TMDB (com o aviso exigido "This product uses the TMDB API but is not endorsed or certified by TMDB." e o logo ou link do TMDB) e a disponibilidade do JustWatch, e que é um projeto de estudo sem fins comerciais. Adicione o link "Sobre" no topo e no rodapé.
- [ ] **Passo 8: Ver no navegador.** Abra `/sobre`, `/sitemap.xml`, `/robots.txt` e `/opengraph-image`. Esperado: tudo carrega, e o ícone aparece na aba. Veja o código-fonte de um filme (Ctrl+U) e confira as tags `og:title` e `og:image`.
- [ ] **Passo 9: Commit e push.** Rode `git commit -m "Adiciona SEO, imagens de compartilhamento, ícone e página Sobre"` e `git push`.
- [ ] **Passo 10: Explicar ao dono** como o Google e o WhatsApp "leem" um site.

---

### Task 10: Testes de ponta a ponta

**Arquivos:**
- Criar: `playwright.config.ts`, `e2e/catalogo.spec.ts`
- Modificar: `package.json` (script `test:e2e`), `vitest.config.ts` (`include: ["tests/**/*.test.ts"]`), `.gitignore` (`test-results/`, `playwright-report/`), componentes que precisem de `data-testid="cartao-filme"`

**Interfaces:**
- Consome: as telas das Tarefas 3–9.
- Produz: `npm run test:e2e`.

- [ ] **Passo 1: Instalar.** Rode `npm i -D @playwright/test @axe-core/playwright` e `npx playwright install chromium`. No config: só Chromium, `baseURL: "http://localhost:3000"` e `webServer` com `command: process.env.CI ? "npm run start" : "npm run dev"`, `port: 3000` e `reuseExistingServer: !process.env.CI`. Adicione `"test:e2e": "playwright test"`.
- [ ] **Passo 2: Escrever os testes** em `e2e/catalogo.spec.ts`:
  - `grade carrega`: em `/`, `getByTestId("cartao-filme")` tem pelo menos 20 itens.
  - `filtro muda a URL`: clicar no link "Netflix" leva a `toHaveURL(/servico=netflix/)`, e o link fica com `aria-current="page"`.
  - `carregar mais adiciona filmes`: guardar a contagem, clicar em "Carregar mais filmes", e a contagem passa a ser maior que a anterior.
  - `abre a página do filme`: clicar no primeiro cartão leva a `toHaveURL(/\/filme\/\d+/)`; o `heading` de nível 1 fica visível e o texto "Onde assistir no Brasil" aparece.
  - `id inválido`: em `/filme/abc`, aparece o texto "Filme não encontrado".
  - `pular para o conteúdo`: em `/`, depois de `keyboard.press("Tab")`, o link "Pular para o conteúdo" está focado.
  - `sem problemas graves de acessibilidade`: `AxeBuilder` em `/` e na página de um filme, e `violations.filter(v => v.impact === "critical" || v.impact === "serious")` dá `[]`.
- [ ] **Passo 3: Rodar.** Rode `npm run test:e2e`. Esperado: 7 testes passando. Se algum falhar, corrija o site, não o teste, a menos que o teste esteja errado. Rode `npm test` de novo para garantir que o Vitest não pega `e2e/`.
- [ ] **Passo 4: Mostrar ao dono** o robô clicando: `npx playwright test --headed`.
- [ ] **Passo 5: Commit e push.** Rode `git commit -m "Adiciona testes de ponta a ponta com Playwright"` e `git push`.
- [ ] **Passo 6: Explicar ao dono** a diferença entre teste unitário e teste de ponta a ponta.

---

### Task 11: Publicar na Vercel e ativar estatísticas

**Arquivos:**
- Modificar: `src/app/layout.tsx` (`<Analytics />` e `<SpeedInsights />`), `CLAUDE.md` (link do site)

- [ ] **Passo 0: Estatísticas.** Rode `npm i @vercel/analytics @vercel/speed-insights`. No `layout.tsx`, adicione `<Analytics />` (de `@vercel/analytics/next`) e `<SpeedInsights />` (de `@vercel/speed-insights/next`). Rode `npm test` e `npm run lint`, depois `git commit -m "Adiciona estatísticas da Vercel"` e `git push`.
- [ ] **Passo 1: Conferir a build local.** Rode `npm run build`. Esperado: termina sem erros. Corrija antes de seguir.
- [ ] **Passo 2: Ligar a Vercel (ação do dono).** Guie: entrar em https://vercel.com com a conta do GitHub, "Add New → Project", importar `catalogo-streaming` e, em **Environment Variables**, adicionar `TMDB_READ_TOKEN` com o mesmo valor do `.env.local`. Depois, clicar em "Deploy".
- [ ] **Passo 3: Ver o site no ar.** O dono abre o link `*.vercel.app`. Esperado: o mesmo site do localhost, com filtro, carregar mais e página do filme funcionando.
- [ ] **Passo 4: Testar a publicação automática.** Mude o subtítulo da página inicial para "disponíveis agora no Brasil, inclusos na assinatura ou grátis". Rode `npm test`, `git commit -m "Ajusta subtítulo da página inicial"` e `git push`. Esperado: em cerca de 1 minuto, o site no ar mostra o texto novo.
- [ ] **Passo 5: Ligar as estatísticas (ação do dono).** No painel do projeto na Vercel, ative **Analytics** e **Speed Insights**. Abra o site no ar algumas vezes. Esperado: as visitas aparecem no painel em alguns minutos.
- [ ] **Passo 6: Anotar o link** no `CLAUDE.md`, fazer commit e push.
- [ ] **Passo 7: Explicar ao dono** o ciclo completo (editar → testar → commit → push → no ar) e o que as estatísticas mostram.

---

### Task 12: Robô de qualidade (CI) e medição final

**Arquivos:**
- Criar: `.github/workflows/ci.yml`
- Modificar: `CLAUDE.md` (notas do Lighthouse)

- [ ] **Passo 1: Secret no GitHub (ação do dono).** Guie: no repositório, abra Settings → Secrets and variables → Actions → New repository secret e crie `TMDB_READ_TOKEN` com o valor do token.
- [ ] **Passo 2: Escrever o workflow.** Nome: "Qualidade". Roda em `push` e `pull_request` na `main`, com `ubuntu-latest`, `actions/checkout@v4` e `actions/setup-node@v4` (`node-version: "lts/*"`, `cache: "npm"`). Os passos são `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npx playwright install --with-deps chromium` e `npm run test:e2e`. O `env` do job tem `TMDB_READ_TOKEN: ${{ secrets.TMDB_READ_TOKEN }}` e `CI: true`.
- [ ] **Passo 3: Ver o robô passar.** Rode `git commit -m "Adiciona robô de qualidade no GitHub Actions"` e `git push`. Esperado: na aba **Actions** do GitHub, a execução "Qualidade" fica verde ✅.
- [ ] **Passo 4: Ver o robô barrar um erro (aula).** Crie a branch `teste-robo`, mude uma expectativa em `tests/formatar.test.ts` para um valor errado, faça commit, rode `git push -u origin teste-robo` e guie o dono a abrir um Pull Request no GitHub. Esperado: o PR mostra ❌. Feche o PR sem juntar, apague a branch e rode `git checkout main` localmente.
- [ ] **Passo 5: Medição final.** No site publicado, rode o Lighthouse do Chrome no modo celular e no modo computador. Esperado: as metas das Restrições globais. Se alguma ficar abaixo, corrija, faça push, meça de novo e anote as notas finais no `CLAUDE.md`.
- [ ] **Passo 6: Commit e push** das notas.
- [ ] **Passo 7: Explicar ao dono** o que é CI e por que times usam Pull Requests. Depois, apresente a **Fase 2** (busca e gênero) e a **Fase 3** (login, banco de dados, "quero assistir"), cada uma começando com uma nova conversa de design.
