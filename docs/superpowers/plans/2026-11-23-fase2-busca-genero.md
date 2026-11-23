# Fase 2: Busca e Gênero, Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** acrescentar ao Catálogo Streaming um filtro "Gênero ▾" (que combina com o serviço) e uma busca por nome com selo de disponibilidade nos 5 serviços do site.

**Arquitetura:** segue a Fase 1. A lógica pura (validar gênero, montar links, normalizar busca, montar selos e ordem) fica em `src/lib/` com testes Vitest. As chamadas ao TMDB ficam em `src/lib/tmdb.ts` (`server-only`, `"use cache"`). As telas são montadas no servidor. O filtro de gênero é um `<details>` com uma lista de links, e a busca é um `<form method="get">`.

**Tecnologias:** Next.js 16.4 (Cache Components), TypeScript, CSS Modules, Vitest, Playwright + axe. As mesmas da Fase 1, nenhuma dependência nova.

**Spec:** `docs/superpowers/specs/2026-11-23-fase2-busca-genero-design.md`

## Restrições globais

- Tudo o que valia na Fase 1 continua valendo: veja o `CLAUDE.md`, o plano `docs/superpowers/plans/2026-11-22-catalogo-streaming.md` e a seção "Restrições globais".
- Dono iniciante: cada tarefa termina com algo visível e uma explicação curta em português.
- `searchParams` e `params` são Promises e são lidos dentro de `<Suspense>`. Leia `node_modules/next/dist/docs/` antes de usar uma API do Next que não apareceu na Fase 1.
- Toda função que chama o TMDB fica em `src/lib/tmdb.ts`, com `"use cache"` + `cacheLife`. Lista de gêneros: `cacheLife("days")`. O resto: `cacheLife("hours")`.
- Endereços:
  - catálogo: `/?servico=<slug>&genero=<id>`
  - busca: `/busca?q=<texto>`
  - filme: `/filme/<id>?servico=<slug>&genero=<id>`
- Textos fixos:
  - "Gênero ▾"
  - "Gênero: <nome> ▾"
  - "Todos os gêneros"
  - "Nenhum filme encontrado com estes filtros."
  - "🔍 Buscar filme…" (placeholder)
  - "Resultados para \"<texto>\""
  - "Digite pelo menos 2 letras para buscar."
  - "Nenhum filme encontrado para \"<texto>\"."
  - "Mostrando os 20 mais relevantes. Tente um nome mais específico."
  - selo "✓ A, B, C +N"
  - selo "Indisponível"
- "Disponível" na busca = algum dos `providerId` de `SERVICOS` (8, 119, 337, 1899, 307) em `flatrate`, `free` ou `ads` de `results.BR`. Os nomes no selo vêm de `SERVICOS`.
- Busca: texto com espaços nas pontas removidos e espaços repetidos reduzidos a um. Menos de 2 caracteres → não chama o TMDB. Mais de 100 → corta em 100. Máximo de 20 resultados (página 1 do TMDB).
- Páginas de busca: `robots: { index: false }` e título `Busca: <texto>`, que vira "Busca: duna · Catálogo Streaming" pelo template.
- Commits em português, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push a cada tarefa. O robô "Qualidade" tem que ficar verde.

## Foco da revisão

1. Texto de busca com acentos e símbolos (`ação & aventura`, `100%`, `"`) → a busca funciona e o texto aparece exatamente como foi digitado, sem quebrar o endereço nem a página.
2. Combinações estranhas no endereço (`?genero=abc`, `?genero=999999`, `?genero=35&servico=xpto`, `?genero=35&genero=28`) → o filtro inválido vira "Todos", sem erro.
3. A consulta de "onde está" falha para **um** resultado → esse cartão aparece sem selo, e os outros aparecem normais.
4. A lista de gêneros do TMDB falha → o botão "Gênero" some, e o catálogo e o "Carregar mais" funcionam ignorando `?genero=`.
5. Uma busca com mais de 20 resultados → aparece a frase "Mostrando os 20 mais relevantes…". Com 20 ou menos, a frase não aparece.

Os testes: (1) Tarefa 5 (e2e); (2) Tarefas 1 e 2; (3) e (5) Tarefa 5 (unitários); (4) Tarefa 1 (unitário).

---

## Estrutura de arquivos

```
src/lib/tipos.ts          + Genero, FilmeBuscado, ResultadoBusca
src/lib/generos.ts        NOVO: lerGenero, lerIdGenero (puros)
src/lib/discover.ts       montarParametrosDiscover ganha o 3º parâmetro genero
src/lib/links.ts          hrefFilme / hrefCatalogo ganham genero
src/lib/busca.ts          NOVO: normalizarBusca, servicosDisponiveis, textoSelo, montarResultados (puros)
src/lib/tmdb.ts           + buscarGeneros, buscarIdsDisponiveis, buscarResultados; buscarFilmes ganha genero
src/components/FiltroGenero.tsx (+ .module.css)   NOVO
src/components/FiltroServicos.tsx                 preserva o gênero
src/components/CaixaBusca.tsx (+ .module.css)     NOVO (client)
src/components/Topo.tsx                           inclui a CaixaBusca
src/components/CartaoFilme.tsx                    + props genero, selo
src/components/GradeFilmes.tsx                    + prop genero
src/components/CarregarMais.tsx                   + prop genero
src/components/Esqueleto.tsx                      EsqueletoFiltro com 7 pílulas
src/app/page.tsx                                  lê e valida o gênero
src/app/api/filmes/route.ts                       aceita genero
src/app/filme/[id]/page.tsx                       Voltar repassa o genero
src/app/busca/page.tsx (+ .module.css)            NOVO
tests/generos.test.ts, tests/busca.test.ts        NOVOS
tests/discover.test.ts, tests/links.test.ts       ampliados
e2e/fase2.spec.ts                                 NOVO
```

## Tipos novos (`src/lib/tipos.ts`, Tarefa 1 e Tarefa 4)

```ts
export type Genero = { id: number; nome: string };
/** servicos: null = não deu para saber (falha); [] = indisponível nos 5 serviços */
export type FilmeBuscado = FilmeResumo & { servicos: Servico[] | null };
export type ResultadoBusca = { filmes: FilmeBuscado[]; temMais: boolean };
```

---

### Task 1: Gênero no catálogo (lógica, TMDB e página lendo `?genero=`)

**Arquivos:**
- Criar: `src/lib/generos.ts`, `tests/generos.test.ts`
- Modificar: `src/lib/tipos.ts`, `src/lib/discover.ts`, `tests/discover.test.ts`, `src/lib/tmdb.ts`, `src/app/page.tsx`

**Interfaces:**
- Produz:
  - `type Genero`
  - `lerGenero(valor: string | string[] | undefined | null, generos: Genero[] | null): Genero | undefined`
  - `lerIdGenero(valor: string | string[] | undefined | null): number | undefined`
  - `montarParametrosDiscover(slug, pagina, genero?: number)`
  - `buscarGeneros(): Promise<Genero[]>`
  - `buscarFilmes(slug, pagina, genero?: number): Promise<PaginaFilmes>`
- Consome: `tmdbFetch`, `servicoPorSlug` (Fase 1).

- [ ] **Passo 1: Escrever os testes que falham.** Em `tests/generos.test.ts`:

```ts
const generos = [{ id: 28, nome: "Ação" }, { id: 35, nome: "Comédia" }];
expect(lerGenero("35", generos)).toEqual({ id: 35, nome: "Comédia" });
expect(lerGenero("999", generos)).toBeUndefined();      // id fora da lista
expect(lerGenero("abc", generos)).toBeUndefined();
expect(lerGenero(["35", "28"], generos)).toBeUndefined(); // dois gêneros no endereço → Todos
expect(lerGenero(undefined, generos)).toBeUndefined();
expect(lerGenero("35", null)).toBeUndefined();          // lista falhou → ignora (Foco 4)
expect(lerIdGenero("35")).toBe(35);
expect(lerIdGenero("0")).toBeUndefined();
expect(lerIdGenero("-3")).toBeUndefined();
expect(lerIdGenero("3.5")).toBeUndefined();
expect(lerIdGenero("abc")).toBeUndefined();
expect(lerIdGenero(["35"])).toBeUndefined();
```

Em `tests/discover.test.ts`, acrescente:

```ts
expect(montarParametrosDiscover("netflix", 1, 35)).toEqual({ ...base, page: "1", with_watch_providers: "8", with_genres: "35" });
expect(montarParametrosDiscover(undefined, 1)).not.toHaveProperty("with_genres");
```

- [ ] **Passo 2: Rodar e ver falhar.** Rode `npm test`. Esperado: FALHA.
- [ ] **Passo 3: Implementar `generos.ts` e o 3º parâmetro de `montarParametrosDiscover`.** Acrescente `Genero` em `tipos.ts`. O `lerIdGenero` aceita só um texto de inteiro positivo (`/^[1-9]\d*$/`).
- [ ] **Passo 4: Rodar os testes.** Rode `npm test`. Esperado: tudo passando.
- [ ] **Passo 5: TMDB.**
  - `buscarGeneros()`: chama `/genre/movie/list` com `language=pt-BR`, usa `cacheLife("days")` e devolve `{ id, nome }[]` em ordem alfabética (`localeCompare` em pt-BR).
  - `buscarFilmes(slug, pagina, genero?)`: repassa `genero` ao `montarParametrosDiscover`.
- [ ] **Passo 6: Página.** No `Catalogo` (`src/app/page.tsx`):
  - lê `genero` de `searchParams`;
  - pega a lista com `buscarGeneros()` dentro de `try/catch` (se falhar, `null`);
  - calcula `genero = lerGenero(valor, generos)`;
  - chama `buscarFilmes(servico?.slug, 1, genero?.id)`;
  - troca a mensagem de lista vazia por "Nenhum filme encontrado com estes filtros.".
- [ ] **Passo 7: Ver no navegador.** Abra `http://localhost:3000/?genero=35` e confira que aparecem comédias. Abra `/?genero=abc` e confira que aparece o catálogo normal.
- [ ] **Passo 8: Commit e push.** Rode `git commit -m "Catálogo aceita filtro por gênero no endereço"`.
- [ ] **Passo 9: Explicar ao dono** como o mesmo pedido ao TMDB recebe mais um filtro (`with_genres`) e por que validamos o id contra a lista.

---

### Task 2: Botão "Gênero ▾" e filtros que preservam um ao outro

**Arquivos:**
- Criar: `src/components/FiltroGenero.tsx`, `src/components/FiltroGenero.module.css`
- Modificar: `src/lib/links.ts`, `tests/links.test.ts`, `src/components/FiltroServicos.tsx`, `src/components/Esqueleto.tsx`, `src/app/page.tsx`
- Criar: `e2e/fase2.spec.ts`

**Interfaces:**
- Consome: `Genero`, `lerGenero` e `buscarGeneros` (Tarefa 1).
- Produz:
  - `hrefCatalogo(slug, genero?: number): string`
  - `hrefFilme(id, slug, genero?: number): string`
  - `<FiltroGenero generos={Genero[]} ativo={number | undefined} servico={string | undefined} />`
  - `<FiltroServicos ativo={string | undefined} genero={number | undefined} />`

- [ ] **Passo 1: Escrever os testes que falham.** Em `tests/links.test.ts`, acrescente:

```ts
expect(hrefCatalogo("netflix", 35)).toBe("/?servico=netflix&genero=35");
expect(hrefCatalogo(undefined, 35)).toBe("/?genero=35");
expect(hrefCatalogo("xpto", 35)).toBe("/?genero=35");
expect(hrefFilme(27205, "netflix", 35)).toBe("/filme/27205?servico=netflix&genero=35");
expect(hrefFilme(27205, undefined, 35)).toBe("/filme/27205?genero=35");
```

Em `e2e/fase2.spec.ts`:
  - **`escolher um gênero mantém o serviço`**:
    - vá para `/?servico=netflix`;
    - clique no texto "Gênero ▾" (o `summary`) e depois no link "Comédia";
    - espere `toHaveURL(/servico=netflix/)` e `toHaveURL(/genero=35/)`;
    - o `summary` deve ter o texto "Gênero: Comédia ▾".
  - **`trocar de serviço mantém o gênero`**:
    - a partir de `/?genero=35`, clique em "Netflix";
    - espere a URL com `servico=netflix` e `genero=35`.
- [ ] **Passo 2: Rodar e ver falhar.** Rode `npm test` e `npm run test:e2e -- e2e/fase2.spec.ts`. Esperado: FALHA.
- [ ] **Passo 3: Implementar.**
  - `links.ts`: os parâmetros saem na ordem `servico` e depois `genero`. Um serviço inválido é omitido.
  - `FiltroServicos`: cada link usa `hrefCatalogo(slug, genero)`.
  - `FiltroGenero`: é um `<details>`. O `<summary>` mostra "Gênero ▾" ou "Gênero: <nome> ▾". Dentro vai uma `<ul>` de links: "Todos os gêneros" (`hrefCatalogo(servico)`) e depois cada gênero (`hrefCatalogo(servico, g.id)`). O ativo recebe `aria-current="page"` e destaque amarelo. A lista abre sobre o conteúdo (`position: absolute`), tem rolagem se for alta e funciona com Tab e Enter.
  - Na página: o `FiltroGenero` aparece na mesma linha das pílulas de serviço, só se a lista de gêneros existir.
  - `EsqueletoFiltro`: passa a ter 7 pílulas.
- [ ] **Passo 4: Rodar os testes.** Rode `npm test` e `npm run test:e2e`. Esperado: tudo passando, inclusive o teste axe da Fase 1.
- [ ] **Passo 5: Ver no navegador.** Abra o menu com o mouse e também com o teclado, escolha "Comédia" e depois "Netflix".
- [ ] **Passo 6: Commit e push.** Rode `git commit -m "Adiciona botão de gênero que combina com o serviço"`.
- [ ] **Passo 7: Explicar ao dono** o `<details>` (abre e fecha sem JavaScript) e por que cada filtro "carrega" o outro no link.

---

### Task 3: "Carregar mais" e "Voltar" respeitam o gênero

**Arquivos:**
- Modificar: `src/app/api/filmes/route.ts`, `src/components/CarregarMais.tsx`, `src/components/GradeFilmes.tsx`, `src/components/CartaoFilme.tsx`, `src/app/page.tsx`, `src/app/filme/[id]/page.tsx`, `e2e/fase2.spec.ts`

**Interfaces:**
- Consome: `lerGenero`, `lerIdGenero`, `buscarGeneros`, `buscarFilmes(slug, pagina, genero)`, `hrefFilme(id, slug, genero)` e `hrefCatalogo(slug, genero)`.
- Produz:
  - `GET /api/filmes?servico=&genero=&pagina=`
  - `<CarregarMais ... genero={number | undefined} />`
  - `<GradeFilmes ... genero={number | undefined} />`
  - `<CartaoFilme ... genero={number | undefined} />`

- [ ] **Passo 1: Escrever os testes que falham** em `e2e/fase2.spec.ts`:
  - **`voltar do filme mantém serviço e gênero`**: vá para `/?servico=netflix&genero=35`, clique no 1º cartão, clique em "← Voltar ao catálogo" e espere a URL terminar em `/?servico=netflix&genero=35`.
  - **`carregar mais respeita o gênero`**:
    - em `/?genero=35`, intercepte (`page.waitForRequest`) o pedido a `/api/filmes` ao clicar em "Carregar mais filmes";
    - espere que a URL do pedido contenha `genero=35`;
    - espere que a contagem de cartões aumente.
- [ ] **Passo 2: Rodar e ver falhar.** Rode `npm run test:e2e -- e2e/fase2.spec.ts`. Esperado: FALHA.
- [ ] **Passo 3: Implementar.**
  - **Rota:** lê `genero` e valida com `lerGenero(valor, await buscarGeneros())`. Se a lista falhar, ignora o gênero.
  - **`CarregarMais`:** inclui `genero` no pedido. Na página, o `key` passa a ser `` `${servico ?? "todos"}-${genero ?? "todos"}` ``.
  - **`GradeFilmes` e `CartaoFilme`:** repassam `genero` para `hrefFilme`.
  - **Página do filme:** `VoltarComFiltro` usa `hrefCatalogo(servico, lerIdGenero(genero))`, sem chamar o TMDB.
- [ ] **Passo 4: Rodar os testes.** Rode `npm test` e `npm run test:e2e`. Esperado: tudo passando.
- [ ] **Passo 5: Commit e push.** Rode `git commit -m "Carregar mais e Voltar respeitam o gênero"`.
- [ ] **Passo 6: Explicar ao dono** como o gênero "viaja" de uma tela para outra pelo endereço.

---

### Task 4: Caixa de busca no topo e página de resultados (sem selo ainda)

**Arquivos:**
- Criar: `src/lib/busca.ts`, `tests/busca.test.ts`, `src/components/CaixaBusca.tsx`, `src/components/CaixaBusca.module.css`, `src/app/busca/page.tsx`, `src/app/busca/page.module.css`
- Modificar: `src/lib/tipos.ts`, `src/lib/tmdb.ts`, `src/components/Topo.tsx`, `src/components/Topo.module.css`, `e2e/fase2.spec.ts`

**Interfaces:**
- Produz:
  - `normalizarBusca(valor: string | string[] | undefined | null): string | null`
  - `type FilmeBuscado`
  - `type ResultadoBusca`
  - `buscarResultados(texto: string): Promise<ResultadoBusca>` (nesta tarefa, com `servicos: null` em todos)
  - `<CaixaBusca />`
- Consome: `tmdbFetch`, `extrairAno`, `urlImagem`, `GradeFilmes` e `CartaoFilme`.

- [ ] **Passo 1: Escrever os testes que falham.** Em `tests/busca.test.ts`:

```ts
expect(normalizarBusca("  duna  ")).toBe("duna");
expect(normalizarBusca("homem   de  ferro")).toBe("homem de ferro");
expect(normalizarBusca("a")).toBeNull();
expect(normalizarBusca("   ")).toBeNull();
expect(normalizarBusca(undefined)).toBeNull();
expect(normalizarBusca(["duna", "x"])).toBeNull();
expect(normalizarBusca("x".repeat(150))).toHaveLength(100);
expect(normalizarBusca("ação & aventura")).toBe("ação & aventura");
```

Em `e2e/fase2.spec.ts`:
  - **`buscar pelo topo abre os resultados`**:
    - em `/`, preencha `getByRole("searchbox", { name: "Buscar filme" })` com "duna" e aperte Enter;
    - espere `toHaveURL(/\/busca\?q=duna/)`;
    - o heading de nível 1 deve conter `Resultados para "duna"`;
    - deve haver pelo menos 1 `cartao-filme`;
    - o campo deve ter o valor "duna".
  - **`busca curta pede 2 letras`**: em `/busca?q=a`, o texto "Digite pelo menos 2 letras para buscar." aparece.
  - **`busca sem resultado`**: em `/busca?q=zzzxqwv`, o texto `Nenhum filme encontrado para "zzzxqwv".` aparece.
- [ ] **Passo 2: Rodar e ver falhar.** Rode `npm test` e `npm run test:e2e -- e2e/fase2.spec.ts`. Esperado: FALHA.
- [ ] **Passo 3: Implementar.**
  - **`normalizarBusca`**: segue as regras das Restrições.
  - **`buscarResultados`**:
    - chama `/search/movie` com `query`, `language=pt-BR`, `include_adult=false` e `page=1`;
    - converte cada resultado em `FilmeBuscado` com `servicos: null`;
    - `temMais = total_results > 20`;
    - usa `"use cache"` + `cacheLife("hours")`.
  - **`CaixaBusca`**:
    - é um componente de cliente com `<form action="/busca" method="get" role="search">`;
    - tem um `<input type="search" name="q" aria-label="Buscar filme" placeholder="🔍 Buscar filme…">`;
    - o valor inicial vem de `useSearchParams().get("q")` quando `usePathname() === "/busca"`;
    - no `Topo`, fica dentro de `<Suspense>` cujo fallback é a mesma caixa vazia (confira na doc local se `useSearchParams` exige isso com Cache Components).
  - **Página `/busca`**:
    - `generateMetadata` dá o título "Busca: <texto>" e `robots: { index: false }`;
    - o conteúdo fica em `<Suspense>` com `EsqueletoGrade` (20);
    - mostra os estados das Restrições (curta, sem resultado, `temMais`);
    - os resultados aparecem em `GradeFilmes`, sem filtros.
  - **Topo no celular**: a caixa ocupa a largura (`flex: 1`) e o "Sobre" continua visível.
- [ ] **Passo 4: Rodar os testes.** Rode `npm test` e `npm run test:e2e`. Esperado: tudo passando.
- [ ] **Passo 5: Ver no navegador.** Busque "duna", "a" e "zzzxqwv", e veja no modo celular.
- [ ] **Passo 6: Commit e push.** Rode `git commit -m "Adiciona busca por nome no topo"`.
- [ ] **Passo 7: Explicar ao dono** o `<form method="get">` (é ele que monta o endereço `?q=`) e por que a busca fica fora do Google.

---

### Task 5: Selos de disponibilidade e ordem na busca

**Arquivos:**
- Modificar: `src/lib/busca.ts`, `tests/busca.test.ts`, `src/lib/tmdb.ts`, `src/components/CartaoFilme.tsx`, `src/components/CartaoFilme.module.css`, `src/app/busca/page.tsx`, `e2e/fase2.spec.ts`

**Interfaces:**
- Consome: `extrairOndeAssistir`, `SERVICOS`, `buscarResultados` e `FilmeBuscado` (Tarefa 4).
- Produz:
  - `servicosDisponiveis(ids: number[] | null): Servico[] | null`
  - `textoSelo(servicos: Servico[] | null): string | null`
  - `montarResultados(filmes: FilmeResumo[], ids: (number[] | null)[], total: number): ResultadoBusca`
  - `buscarIdsDisponiveis(id: number): Promise<number[]>`
  - `<CartaoFilme ... selo={{ texto: string; disponivel: boolean } | undefined} />`

- [ ] **Passo 1: Escrever os testes que falham.** Em `tests/busca.test.ts`:

```ts
expect(servicosDisponiveis([8, 1899, 300]).map(s => s.nome)).toEqual(["Netflix", "HBO Max"]); // ordem de SERVICOS; 300 ignorado
expect(servicosDisponiveis([300])).toEqual([]);
expect(servicosDisponiveis(null)).toBeNull();
expect(textoSelo(servicosDisponiveis([119, 1899]))).toBe("✓ Prime Video, HBO Max");
expect(textoSelo(servicosDisponiveis([8, 119, 337, 1899, 307]))).toBe("✓ Netflix, Prime Video, Disney+ +2");
expect(textoSelo([])).toBe("Indisponível");
expect(textoSelo(null)).toBeNull();
const f = (id: number) => ({ id, titulo: `F${id}`, ano: "", nota: 0, capa: null });
const r = montarResultados([f(1), f(2), f(3), f(4)], [[300], null, [8], [119]], 25);
expect(r.filmes.map(x => x.id)).toEqual([3, 4, 1, 2]); // disponíveis primeiro, relevância mantida
expect(r.filmes[3].servicos).toBeNull();              // falha → sem selo (Foco 3)
expect(r.temMais).toBe(true);                          // Foco 5
expect(montarResultados([f(1)], [[8]], 20).temMais).toBe(false);
```

Em `e2e/fase2.spec.ts`:
  - **`resultados têm selo`**: em `/busca?q=duna`, existe pelo menos um elemento com texto que começa com "✓ " ou é "Indisponível".
  - **`busca com acentos e símbolos`** (Foco 1): em `/busca?q=${encodeURIComponent('ação & aventura')}`, o heading contém `Resultados para "ação & aventura"` e a página não mostra a tela de erro.
  - **`busca sem problemas graves de acessibilidade`**: o `AxeBuilder` em `/busca?q=duna` não encontra violações `critical`/`serious`.
- [ ] **Passo 2: Rodar e ver falhar.** Rode `npm test` e `npm run test:e2e -- e2e/fase2.spec.ts`. Esperado: FALHA.
- [ ] **Passo 3: Implementar.**
  - **`servicosDisponiveis`**: filtra `SERVICOS` pelos ids.
  - **`textoSelo`**: até 3 nomes; depois, `" +N"`.
  - **`montarResultados`**: ordenação estável. O grupo "com pelo menos 1 serviço" vem antes; o resto mantém a ordem.
  - **`buscarIdsDisponiveis(id)`**: chama `/movie/{id}/watch/providers` e devolve os ids de `extrairOndeAssistir(results.BR)`. Usa `"use cache"` + `cacheLife("hours")`.
  - **`buscarResultados`**: depois da busca, chama `buscarIdsDisponiveis` para todos os filmes com `Promise.allSettled`. Rejeitado vira `null`. Depois, `montarResultados`.
  - **`CartaoFilme`**:
    - com `selo`, mostra uma pílula abaixo do ano: verde `rgba(46,204,113,.15)` com texto `#6ee7a0` quando disponível, ou cinza com texto `#8a91a3` quando indisponível;
    - indisponível também deixa a capa com `opacity: .55` e `filter: grayscale(.6)`;
    - o contraste do texto do selo tem que passar no axe.
  - **Página de busca**: passa o `selo` de cada filme (`textoSelo` + `disponivel`).
- [ ] **Passo 4: Rodar os testes.** Rode `npm test` e `npm run test:e2e`. Esperado: tudo passando.
- [ ] **Passo 5: Ver no navegador.** Busque "duna" e "homem de ferro" e confira os selos e a ordem.
- [ ] **Passo 6: Commit e push.** Rode `git commit -m "Busca mostra selo de disponibilidade e ordena os disponíveis primeiro"`.
- [ ] **Passo 7: Explicar ao dono** os pedidos em paralelo (`Promise.allSettled`) e por que uma falha num filme não derruba a busca.

---

### Task 6: Conferência final no ar

**Arquivos:**
- Modificar: `CLAUDE.md` (seção "Fase 2", com o que existe e o link do spec)

- [ ] **Passo 1: Conferir localmente.** Rode `npm run lint`, `npm test`, `npm run build` e `npm run test:e2e`. Esperado: tudo verde.
- [ ] **Passo 2: Atualizar o `CLAUDE.md`, fazer commit e push.** Espere o robô "Qualidade" ficar verde (pela API do GitHub ou pelo dono) e a Vercel publicar.
- [ ] **Passo 3: Conferir no ar.** Confira, no site publicado: `/?servico=netflix&genero=35`, `/busca?q=duna` e o Lighthouse do celular e do computador na página de busca. Esperado: Acessibilidade, Boas Práticas e SEO ≥ 90. A busca tem `noindex`, então o item de SEO "indexável" pode apontar isso, e é esperado.
- [ ] **Passo 4: Explicar ao dono** o que mudou no site e mostrar como testar no celular.
