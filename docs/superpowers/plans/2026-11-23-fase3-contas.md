# Catálogo Streaming, Fase 3: Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** contas com Google, listas "Quero assistir" e "Já assisti" (com 👍/👎), "Vistos recentemente", "Buscas recentes" e a parte da LGPD (privacidade, histórico desligável, baixar dados, excluir conta).

**Arquitetura:**
- **Banco:** Postgres (Neon em produção e no computador do dono; um Postgres descartável no robô do GitHub), acessado pelo driver `pg` com Drizzle. As tabelas são criadas por migrações do `drizzle-kit`.
- **Login:** Better Auth com o provedor Google, guardando contas e sessões no mesmo banco.
- **Sem atrasar o catálogo:** as páginas continuam em cache. As partes pessoais carregam dentro de `<Suspense>`. Um pequeno "estado pessoal" no navegador, preenchido pelo menu da conta no topo, alimenta as marquinhas "✓ visto" e as buscas recentes, sem pedidos extras.
- **Quem altera dados:** só o servidor, por Server Actions que sempre conferem a sessão.

**Tecnologias:** Next.js 16.4 (Cache Components), React 19.3, `better-auth@^1.7`, `drizzle-orm@^0.45`, `drizzle-kit@^0.31`, `pg@^8` + `@types/pg`, `@vercel/functions` (`attachDatabasePool`), Vitest e Playwright.

**Spec:** `docs/superpowers/specs/2026-11-23-fase3-contas-design.md`

## Restrições globais

- O dono é **iniciante** e fala português. Toda tarefa termina com algo para ver no navegador e com uma explicação curta, em português simples, do que foi feito e por quê.
- Ações em sites externos (Vercel, Neon, Google Cloud, GitHub) são feitas **pelo dono**: quem implementa dá o passo a passo e espera a confirmação.
- Trabalho no ramo `fase-3-contas`. Commits pequenos, com mensagem em português e terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No fim, push e Pull Request aberto pelo dono no site do GitHub (o `gh` não está instalado).
- No PowerShell do dono, use `npm.cmd` / `npx.cmd`.
- Antes de escrever código com Next.js, leia o guia em `node_modules/next/dist/docs/`. Em especial: `01-app/02-guides/authentication-with-cache-components.md` e `01-app/02-guides/data-security.md`.
- Antes de escrever código com Better Auth, confira a API real em `node_modules/better-auth` (a versão 1.7 pode diferir da memória): `better-auth/next-js` (`toNextJsHandler`, `nextCookies`), `better-auth/adapters/drizzle`, `better-auth/react` (`createAuthClient`) e o plugin de proxy OAuth.
- Segredos só em `.env.local` e na Vercel: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Todo arquivo que usa um deles, ou que fala com o banco ou com o TMDB, começa com `import "server-only";`.
- Better Auth com `telemetry: { enabled: false }`. Não mandamos dados de uso para terceiros.
- O banco guarda só o **id do TMDB** de cada filme.
- Limites: 500 em "Quero assistir", 2.000 em "Já assisti", 20 vistos recentemente, 5 buscas e 24 filmes por página na Minha conta.
- Ler a sessão sempre dentro de `<Suspense>`, nunca no topo de um layout.
- Para quem **não** está logado, as páginas do catálogo, da busca e do filme **não consultam o banco**.
- Desempenho: o Lighthouse não pode cair abaixo das notas atuais (computador 100; celular 91–98).
- Textos fixos da interface: "Entrar", "Entrar com Google", "Minha conta", "Sair", "+ Quero assistir", "✓ Na sua lista", "Já assisti", "✓ Assistido", "✓ visto", "Guardar meu histórico", "Apagar histórico", "Baixar meus dados", "Excluir minha conta", "Buscas recentes", "Apagar todas".
- Contato na privacidade: `catalogostreamingof@gmail.com`. Responsável: "o responsável pelo Catálogo Streaming, um projeto pessoal".
- URL de produção: `https://catalogo-streaming-one.vercel.app`.

## Review Focus

1. **`?volta=` usado para redirecionar a outro site** (`//mal.com`, `https://mal.com`, `/\mal.com`): deve voltar para `/`. Testado em `lerVolta` (Tarefa 2).
2. **Ids de filme estranhos nas ações** (`"abc"`, `0`, `-3`, `1.5`, `"12abc"`, acima de 2.147.483.647): recusados sem tocar no banco. Testado em `lerIdFilme` (Tarefa 4).
3. **Banco fora do ar:** o topo mostra "Entrar" e o catálogo abre normalmente, sem a tela de erro. Testado em `comPadraoSeFalhar` (Tarefa 2).
4. **Cliques repetidos e rápidos** em "+ Quero assistir": a lista termina com 0 ou 1 linha do filme, nunca duplicada (gravações idempotentes, com chave única). Testado no e2e da Tarefa 4.
5. **Depois de excluir a conta,** o cookie de sessão que ficou guardado não pode continuar "logado": o topo mostra "Entrar" e `/minha-conta` manda para `/entrar`. Testado no e2e da Tarefa 8.

---

### Tarefa 1: Banco de dados e tabelas

**Files:**
- Create: `drizzle.config.ts`, `src/db/schema.ts`, `src/db/index.ts`, `src/lib/auth.ts` (configuração mínima, ainda sem botões), `drizzle/` (migrações geradas)
- Modify: `package.json` (dependências e scripts), `.github/workflows/ci.yml`

**Interfaces:**
- Produces:
  - `db` (Drizzle, `src/db/index.ts`);
  - as tabelas em `src/db/schema.ts`: `user`, `session`, `account` e `verification` (Better Auth), mais `queroAssistir`, `assistidos`, `vistosRecentes` e `buscasRecentes`;
  - a coluna `historicoLigado boolean not null default true` em `user` (via `user.additionalFields` da Better Auth);
  - `auth` (`src/lib/auth.ts`).

- [ ] **Passo 1: O dono ativa a Neon.** Guie-o assim:
  1. Vercel → projeto → Storage → Neon (plano Free), ligado a Production e Preview, com "criar ramo do banco para cada prévia" ligado.
  2. No painel da Neon, criar o ramo `dev` e copiar a URL dele (versão "pooled") para `.env.local` como `DATABASE_URL`.

  Espere a confirmação.
- [ ] **Passo 2:** Instale `better-auth drizzle-orm pg @vercel/functions` e, para desenvolvimento, `drizzle-kit @types/pg`.
- [ ] **Passo 3:** Crie o esquema:
  - Tabelas da Better Auth geradas pela CLI dela (ver `node_modules/better-auth`), com `historicoLigado` em `user`.
  - `quero_assistir`: `usuario_id` (FK `user.id`, `on delete cascade`), `filme_id integer`, `criado_em timestamptz default now()`, PK (`usuario_id`, `filme_id`).
  - `assistidos`: as mesmas colunas, mais `nota text null` com `check (nota in ('gostei','nao_gostei'))`.
  - `vistos_recentes`: `usuario_id`, `filme_id`, `visto_em`, PK (`usuario_id`, `filme_id`).
  - `buscas_recentes`: `usuario_id`, `texto text`, `chave text` (texto em minúsculas), `buscado_em`, PK (`usuario_id`, `chave`).
  - Índices por (`usuario_id`, data desc).
  - Confira que `session` e `account` também têm `on delete cascade`.
- [ ] **Passo 4:** Em `src/db/index.ts`, crie um `Pool` do `pg` com `DATABASE_URL` e chame `attachDatabasePool(pool)`. Em `src/lib/auth.ts`, use o adaptador Drizzle (`provider: "pg"`), `telemetry: { enabled: false }` e `session.cookieCache` ligado por 5 minutos. Os dois arquivos começam com `server-only`.
- [ ] **Passo 5:** Scripts:
  - `"db:gerar": "drizzle-kit generate"`;
  - `"db:migrar": "drizzle-kit migrate"`;
  - `"build": "npm run db:migrar && next build"`, para que cada publicação da Vercel atualize o banco do seu ambiente.

  Rode `npm.cmd run db:gerar` e depois `npm.cmd run db:migrar`. Esperado: migração aplicada sem erro.
- [ ] **Passo 6:** CI: no `ci.yml`, acrescente um serviço `postgres:17` e as variáveis:
  - `DATABASE_URL=postgres://postgres:postgres@localhost:5432/catalogo`;
  - `BETTER_AUTH_SECRET` com um valor fixo só de teste;
  - `BETTER_AUTH_URL=http://localhost:3000`;
  - `GOOGLE_CLIENT_ID=teste` e `GOOGLE_CLIENT_SECRET=teste`.
- [ ] **Passo 7:** `npm.cmd run lint`, `npm.cmd test` e `npm.cmd run build` passam.
- [ ] **Passo 8:** **Para o dono ver:** no painel da Neon → Tables, ramo `dev`, as 8 tabelas aparecem. Explique o que é cada uma.
- [ ] **Passo 9:** Commit: `Banco de dados: tabelas de contas, listas e histórico`.

### Tarefa 2: Entrar e sair com Google

**Files:**
- Create:
  - `src/lib/conta.ts` (lógica pura) e `tests/conta.test.ts`;
  - `src/lib/sessao.ts`;
  - `src/lib/auth-cliente.ts`;
  - `src/app/api/auth/[...all]/route.ts`;
  - `src/app/entrar/page.tsx` + `.module.css`;
  - `src/components/AreaConta.tsx`, `MenuConta.tsx`, `BotaoGoogle.tsx`, `LinkEntrar.tsx`, `AreaConta.module.css`;
  - `src/components/estadoPessoal.ts`.
- Modify: `src/lib/auth.ts` (Google, proxy OAuth, `nextCookies`, login de teste), `src/components/Topo.tsx`, `src/app/robots.ts`

**Interfaces:**
- Produces:
  - `lerVolta(valor: unknown): string`: só aceita caminho do próprio site (começa com `/`, não com `//` nem `/\`); senão devolve `"/"`.
  - `comPadraoSeFalhar<T>(fn: () => Promise<T>, padrao: T): Promise<T>`: devolve o padrão e registra no `console.error` se `fn` falhar.
  - `loginDeTesteLigado(env: Record<string, string | undefined>): boolean`: verdadeiro só quando `LOGIN_DE_TESTE === "1"` **e** `VERCEL` está vazio.
  - `type Usuario = { id: string; nome: string; email: string; foto: string | null; historico: boolean }`.
  - `obterUsuario(): Promise<Usuario | null>` (`src/lib/sessao.ts`): lê os headers, usa `comPadraoSeFalhar(..., null)` e não consulta o banco quando não há cookie.
  - `exigirUsuario(volta: string): Promise<Usuario>`: sem login, faz `redirect("/entrar?volta=" + encodeURIComponent(volta))`.
  - `authClient` (`src/lib/auth-cliente.ts`).
  - O estado pessoal (`src/components/estadoPessoal.ts`, só no navegador):
    - `type EstadoPessoal = { logado: boolean; assistidos: ReadonlySet<number>; buscas: readonly string[]; historico: boolean }`;
    - `definirEstado(parcial: Partial<EstadoPessoal>): void`;
    - `useEstadoPessoal(): EstadoPessoal` (com `useSyncExternalStore`; no servidor devolve "não logado");
    - `<IniciarEstadoPessoal estado={...} />`.

- [ ] **Passo 1: Testes que falham** em `tests/conta.test.ts`:
  - `lerVolta`: `"/filme/27205"` vira `"/filme/27205"`; `"/busca?q=duna"` fica igual; `"//mal.com"`, `"https://mal.com"`, `"/\\mal.com"`, `""`, `undefined` e `["/a", "/b"]` viram `"/"`.
  - `comPadraoSeFalhar`: com uma função que falha devolve o padrão, e com uma que funciona devolve o valor dela.
  - `loginDeTesteLigado`: `{LOGIN_DE_TESTE:"1"}` dá `true`; `{LOGIN_DE_TESTE:"1", VERCEL:"1"}` dá `false`; `{}` dá `false`.
- [ ] **Passo 2:** `npm.cmd test -- conta`: FAIL (funções não existem).
- [ ] **Passo 3:** Implemente as funções em `src/lib/conta.ts`.
- [ ] **Passo 4:** `npm.cmd test -- conta`: PASS.
- [ ] **Passo 5: O dono cria o login no Google.** Passo a passo no Google Cloud Console:
  1. Criar o projeto "Catálogo Streaming".
  2. Tela de consentimento: externo; e-mail de suporte `catalogostreamingof@gmail.com`; escopos `openid`, `email` e `profile`; **publicar o app**.
  3. Criar a credencial "ID do cliente OAuth / Aplicativo da Web" com:
     - origens: `http://localhost:3000` e a URL de produção;
     - URIs de redirecionamento: `http://localhost:3000/api/auth/callback/google` e `https://catalogo-streaming-one.vercel.app/api/auth/callback/google`.

  Ele coloca o ID e o segredo em `.env.local` e na Vercel, junto com um `BETTER_AUTH_SECRET` gerado por você (`npx.cmd @better-auth/cli secret` ou 32 bytes aleatórios) e `BETTER_AUTH_URL` (`http://localhost:3000` no computador e a URL de produção na Vercel). Espere a confirmação.
- [ ] **Passo 6:** Complete `auth`:
  - `socialProviders.google` com `prompt: "select_account"`;
  - plugin `nextCookies()`;
  - plugin de proxy OAuth com `productionURL` igual à URL de produção, para o login funcionar nas prévias;
  - `trustedOrigins` restrito às prévias **deste** projeto na Vercel (o padrão mais estreito que a Better Auth aceitar);
  - `emailAndPassword.enabled = loginDeTesteLigado(process.env)` (é o "login de teste": nunca liga na Vercel);
  - na rota `src/app/api/auth/[...all]/route.ts`, `toNextJsHandler(auth)`.
- [ ] **Passo 7:** Telas:
  - `/entrar`: título "Entrar", texto curto, `BotaoGoogle` (`authClient.signIn.social({ provider: "google", callbackURL: lerVolta(volta) })`) e link para `/privacidade`. `metadata.robots = { index: false }`. Se a pessoa já estiver logada, redireciona para `volta`.
  - `Topo`: `<Suspense fallback={<span className=... aria-hidden />}>` com tamanho fixo, para não "pular", envolvendo `<AreaConta />`.
  - `AreaConta` (servidor): chama `obterUsuario()`.
    - Sem pessoa: mostra `LinkEntrar`, um link "Entrar" para `/entrar?volta=<página atual>` (usa `usePathname`).
    - Com pessoa: mostra `MenuConta` (usa `MenuFechavel`; foto ou `iniciais(nome)`; itens "Minha conta" e "Sair") e `IniciarEstadoPessoal` com `logado: true` e `historico`. Os assistidos e as buscas entram nas Tarefas 5 e 7.
  - "Sair": `authClient.signOut()` e depois `router.refresh()`.
  - `robots.ts`: `disallow` também `/minha-conta` e `/entrar`.
- [ ] **Passo 8:** `npm.cmd run lint`, `npm.cmd test` e `npm.cmd run build` passam.
- [ ] **Passo 9:** **Para o dono ver:** `npm.cmd run dev`, clicar em "Entrar", escolher a conta Google e ver a própria foto no topo; depois "Sair". Mostrar a linha nova na tabela `user` da Neon.
- [ ] **Passo 10:** Commit: `Login com Google: Entrar e Sair no topo`.

### Tarefa 3: Pessoa de teste para o robô

**Files:**
- Create: `e2e/apoio/login.ts`, `e2e/conta.spec.ts`
- Modify: `playwright.config.ts` (variável `LOGIN_DE_TESTE=1` no `webServer.env`), `.github/workflows/ci.yml` (`LOGIN_DE_TESTE: "1"`)

**Interfaces:**
- Produces: `entrarComoTeste(page: Page): Promise<{ email: string }>`. Cria uma pessoa nova com e-mail aleatório `teste-<uuid>@exemplo.com` por `page.request.post("/api/auth/sign-up/email", ...)`. O cookie fica no navegador do teste.

- [ ] **Passo 1:** Escreva `e2e/conta.spec.ts`:
  - `"entrar e sair"`: chamar `entrarComoTeste`, abrir `/`, ver o botão do menu da conta, clicar em "Sair" e ver o link "Entrar".
  - Que o atalho fica desligado na Vercel já está coberto pelo teste unitário de `loginDeTesteLigado` (Tarefa 2).
- [ ] **Passo 2:** `npx.cmd playwright test conta`: FAIL (helper não existe).
- [ ] **Passo 3:** Implemente `entrarComoTeste` e a variável no `webServer`.
- [ ] **Passo 4:** `npx.cmd playwright test`: tudo PASS (os testes antigos também).
- [ ] **Passo 5:** **Para o dono ver:** `npx.cmd playwright test conta --headed --workers=1`. Explique por que o robô não usa o Google e por que esse atalho não existe no site oficial.
- [ ] **Passo 6:** Commit: `Robô de testes consegue entrar com uma pessoa de teste`.

### Tarefa 4: "Quero assistir"

**Files:**
- Create:
  - `src/lib/listas.ts` + `tests/listas.test.ts`;
  - `src/lib/dados/listas.ts`;
  - `src/app/acoes.ts`;
  - `src/components/AreaPessoalFilme.tsx`, `BotoesLista.tsx`, `BotoesLista.module.css`;
  - `src/app/minha-conta/page.tsx` + `.module.css`;
  - `src/components/ItemLista.tsx`, `Paginacao.tsx`;
  - `e2e/listas.spec.ts`.
- Modify: `src/app/filme/[id]/page.tsx` (insere `<Suspense><AreaPessoalFilme filmeId /></Suspense>` abaixo de "Onde assistir")

**Interfaces:**
- Consumes: `obterUsuario`, `exigirUsuario`, `db`, `queroAssistir`, `buscarDetalhes`, `buscarIdsDisponiveis`, `servicosDisponiveis` e `textoSelo`.
- Produces:
  - Em `src/lib/listas.ts`:
    - `LIMITES = { quero: 500, assistidos: 2000, vistos: 20, buscas: 5, porPagina: 24 } as const`;
    - `lerIdFilme(v: unknown): number | null`;
    - `type Aba = "quero" | "assistidos" | "recentes"`;
    - `lerAba(v: unknown): Aba` (padrão `"quero"`).
  - Em `src/lib/dados/listas.ts`:
    - `estadoDoFilme(usuarioId: string, filmeId: number): Promise<{ quero: boolean; assistido: boolean; nota: Nota }>`;
    - `marcarQuero(usuarioId: string, filmeId: number, marcado: boolean): Promise<"ok" | "limite">`;
    - `listarQuero(usuarioId: string, pagina: number): Promise<{ ids: number[]; total: number }>`.
  - Em `src/app/acoes.ts` (`"use server"`):
    - `type Resultado = { ok: true } | { ok: false; motivo: "sem-login" | "limite" | "invalido" | "erro" }`;
    - `alternarQuero(filmeId: number, marcado: boolean): Promise<Resultado>`;
    - `removerDaLista(lista: Aba, filmeId: number): Promise<Resultado>`: usado pelo botão "Remover" de `ItemLista` nas três abas ("recentes" passa a funcionar na Tarefa 6).

- [ ] **Passo 1: Testes que falham:**
  - `lerIdFilme`: `27205` e `"27205"` viram `27205`; `"abc"`, `0`, `-3`, `1.5`, `"12abc"`, `2147483648` e `null` viram `null`.
  - `lerAba`: `"assistidos"` fica `"assistidos"`; `"xyz"` e `undefined` viram `"quero"`.
- [ ] **Passo 2:** `npm.cmd test -- listas`: FAIL.
- [ ] **Passo 3:** Implemente `src/lib/listas.ts`.
- [ ] **Passo 4:** `npm.cmd test -- listas`: PASS.
- [ ] **Passo 5:** Implemente os dados e a ação:
  - `marcarQuero(true)` usa `insert ... on conflict do nothing` e devolve `"limite"` se a pessoa já tem 500 e o filme ainda não está na lista;
  - `marcarQuero(false)` apaga a linha;
  - toda ação valida com `lerIdFilme`, pega a pessoa **só** da sessão (nunca de um parâmetro) e devolve `Resultado`.
- [ ] **Passo 6:** Telas:
  - `AreaPessoalFilme` (servidor):
    - sem pessoa: links com cara de botão para `/entrar?volta=/filme/<id>`;
    - com pessoa: `BotoesLista` (cliente) com o estado inicial;
    - se o banco falhar: "Não foi possível carregar sua lista agora."
  - `BotoesLista`: botão com `aria-pressed` que troca entre "+ Quero assistir" e "✓ Na sua lista", com atualização otimista (`useOptimistic`/`useTransition`). Se falhar, volta ao estado anterior e mostra um aviso (`role="status"`). No limite: "Sua lista chegou ao limite de 500 filmes."
  - `/minha-conta`: lê `?aba` e `?pagina` com `lerAba` e `lerPagina`, chama `exigirUsuario("/minha-conta")` e tem `robots: { index: false }`. Mostra as abas como links (`aria-current="page"` na atual) e a aba "Quero assistir" com `ItemLista`: o `CartaoFilme` com o selo "onde está" e o botão "Remover" fora do link. Um filme que o TMDB não devolver aparece como "Filme #<id>" com "Remover". Tem `Paginacao` (Anterior/Próxima). Lista vazia: "Sua lista está vazia. Abra um filme e toque em '+ Quero assistir'."
  - O link "Minha conta" do menu já aponta para cá.
- [ ] **Passo 7:** e2e em `e2e/listas.spec.ts`:
  - `"sem login, o botão leva para entrar e volta ao filme"`: o `href` contém `/entrar?volta=%2Ffilme%2F`.
  - `"marcar quero assistir aparece na Minha conta"`.
  - `"remover da Minha conta tira da lista"`.
  - `"cliques rápidos não duplicam"`: clicar 3 vezes rápido, recarregar e ver a Minha conta com 0 ou 1 cartão desse filme, de acordo com o botão.
- [ ] **Passo 8:** `npm.cmd run lint`, `npm.cmd test`, `npm.cmd run build` e `npx.cmd playwright test`: PASS.
- [ ] **Passo 9:** **Para o dono ver:** marcar 2 filmes e abrir Minha conta.
- [ ] **Passo 10:** Commit: `Lista "Quero assistir" e página Minha conta`.

### Tarefa 5: "Já assisti", 👍/👎 e "✓ visto"

**Files:**
- Modify: `src/lib/listas.ts`, `tests/listas.test.ts`, `src/lib/dados/listas.ts`, `src/app/acoes.ts`, `src/components/BotoesLista.tsx`, `src/components/AreaConta.tsx`, `src/components/CartaoFilme.tsx`, `src/app/minha-conta/page.tsx`, `e2e/listas.spec.ts`
- Create: `src/components/MarcaVisto.tsx`

**Interfaces:**
- Produces:
  - `type Nota = "gostei" | "nao_gostei" | null` e `lerNota(v: unknown): Nota | undefined` (`undefined` = inválida);
  - `marcarAssistido(usuarioId, filmeId, marcado: boolean): Promise<"ok" | "limite">`: ao marcar, apaga de `quero_assistir` **na mesma transação**; ao desmarcar, a nota vai junto;
  - `darNota(usuarioId, filmeId, nota: Nota): Promise<void>`: só atualiza se o filme estiver assistido;
  - `listarAssistidos(usuarioId, pagina): Promise<{ itens: { filmeId: number; nota: Nota }[]; total: number }>`;
  - `idsAssistidos(usuarioId): Promise<number[]>`;
  - as ações `alternarAssistido(filmeId, marcado)` e `definirNota(filmeId, nota)`;
  - `<MarcaVisto filmeId />` (cliente): mostra "✓ visto" quando `useEstadoPessoal().assistidos` tem o id.

- [ ] **Passo 1: Testes que falham:** `lerNota`: `"gostei"`, `"nao_gostei"` e `null` ficam iguais; `"amei"`, `1` e `undefined` viram `undefined`.
- [ ] **Passo 2:** FAIL.
- [ ] **Passo 3:** Implemente `lerNota`.
- [ ] **Passo 4:** PASS.
- [ ] **Passo 5:** Implemente os dados e as ações. `AreaConta` passa `assistidos: idsAssistidos(...)` para `IniciarEstadoPessoal`. As ações de assistido também chamam `definirEstado` no navegador depois do sucesso, para a marquinha aparecer sem recarregar.
- [ ] **Passo 6:** Telas:
  - `BotoesLista` ganha o botão "Já assisti" / "✓ Assistido" (`aria-pressed`). Depois de assistido, aparecem 👍 e 👎, com nomes acessíveis "Gostei" e "Não gostei" e `aria-pressed`. Clicar de novo na nota escolhida tira a nota.
  - `CartaoFilme` ganha `<MarcaVisto filmeId={filme.id} />` sobre a capa. Ele continua sendo componente de servidor; só a marquinha é de cliente.
  - Aba "Já assisti" na Minha conta, com a nota de cada filme. Lista vazia: "Nenhum filme marcado como assistido ainda."
- [ ] **Passo 7:** e2e:
  - `"já assisti tira o filme da lista quero assistir"`;
  - `"filme assistido mostra ✓ visto no catálogo"`: abrir `/`, marcar o primeiro filme como assistido e voltar ao catálogo;
  - `"nota gostei aparece na Minha conta"`.
- [ ] **Passo 8:** Lint, testes, build e e2e: PASS.
- [ ] **Passo 9:** **Para o dono ver:** marcar um filme como assistido, dar 👍, ver o "✓ visto" no catálogo e na aba.
- [ ] **Passo 10:** Commit: `"Já assisti" com nota e marquinha ✓ visto no catálogo`.

### Tarefa 6: Vistos recentemente

**Files:**
- Create: `src/lib/dados/historico.ts`, `src/components/RegistrarVisita.tsx`
- Modify: `src/app/acoes.ts`, `src/components/AreaPessoalFilme.tsx`, `src/app/minha-conta/page.tsx`, `e2e/listas.spec.ts`

**Interfaces:**
- Produces:
  - `registrarVisita(usuarioId, filmeId): Promise<void>`: upsert em `visto_em = now()` e depois apaga o que passar dos 20 mais recentes;
  - `listarVistos(usuarioId): Promise<number[]>`;
  - a ação `registrarVisitaAcao(filmeId): Promise<void>`, que não faz nada se a pessoa não estiver logada ou estiver com o histórico desligado;
  - `<RegistrarVisita filmeId />` (cliente): chama a ação uma vez num `useEffect`. Assim a visita é registrada **só quando a página abre de verdade**, nunca num pré-carregamento.

- [ ] **Passo 1:** e2e que falha: `"abrir um filme aparece em vistos recentemente"`. Abrir 2 filmes; na aba "Vistos recentemente", o último aberto aparece primeiro. Rode e veja FAIL.
- [ ] **Passo 2:** Implemente. `AreaPessoalFilme` só renderiza `RegistrarVisita` para uma pessoa com `historico === true`. A aba mostra os 20 sem paginação, com "Remover" em cada um. Vazia: "Os filmes que você abrir aparecem aqui."
- [ ] **Passo 3:** e2e: PASS. Lint, testes e build: PASS.
- [ ] **Passo 4:** **Para o dono ver:** abrir 3 filmes e ver a aba.
- [ ] **Passo 5:** Commit: `Vistos recentemente`.

### Tarefa 7: Buscas recentes

**Files:**
- Modify:
  - `src/lib/listas.ts` + `tests/listas.test.ts` (`chaveBusca`);
  - `src/lib/dados/historico.ts`;
  - `src/app/acoes.ts`;
  - `src/components/AreaConta.tsx` (passa `buscas`);
  - `src/components/CaixaBusca.tsx` + `.module.css`;
  - `src/app/busca/page.tsx` (renderiza `<RegistrarBusca texto />` quando há resultados);
  - `e2e/listas.spec.ts`.
- Create: `src/components/RegistrarBusca.tsx`, `src/components/BuscasRecentes.tsx`

**Interfaces:**
- Produces:
  - `chaveBusca(texto: string): string`: o texto normalizado (`normalizarBusca`) em minúsculas;
  - `registrarBusca(usuarioId, texto)`: upsert por `chave` e corte nas 5 mais recentes;
  - `listarBuscas(usuarioId): Promise<string[]>`;
  - `apagarBusca(usuarioId, texto | null)` (`null` = todas);
  - as ações `registrarBuscaAcao(texto)` (que usa `normalizarBusca` e não faz nada sem login ou com o histórico desligado) e `apagarBuscaAcao(texto: string | null)`.

- [ ] **Passo 1: Teste que falha:** `chaveBusca("  Duna   Parte 2 ")` dá `"duna parte 2"`; `chaveBusca("DUNA")` é igual a `chaveBusca("duna")`.
- [ ] **Passo 2:** FAIL, depois implemente, depois PASS.
- [ ] **Passo 3:** Telas:
  - Para quem está logado com buscas guardadas, focar a caixa abre a lista "Buscas recentes", logo abaixo dela.
  - Cada busca é um link para `/busca?q=...` e tem um botão "×" com o nome "Apagar busca <texto>". Há também o botão "Apagar todas".
  - A lista fecha com Esc (devolvendo o foco à caixa), com clique fora e ao começar a digitar.
  - Quem não está logado não vê nada diferente.
  - `RegistrarBusca` chama a ação num `useEffect` e atualiza `definirEstado({ buscas })`.
- [ ] **Passo 4:** e2e: `"busca aparece em buscas recentes"` (buscar "duna", focar a caixa e ver "duna") e `"apagar todas limpa a lista"`.
- [ ] **Passo 5:** Lint, testes, build e e2e: PASS.
- [ ] **Passo 6:** **Para o dono ver:** fazer 2 buscas e clicar na caixa.
- [ ] **Passo 7:** Commit: `Buscas recentes na caixa de busca`.

### Tarefa 8: Privacidade e dados (LGPD)

**Files:**
- Create:
  - `src/app/privacidade/page.tsx` + `.module.css`;
  - `src/lib/dados/conta.ts`;
  - `src/app/api/eu/dados/route.ts`;
  - `src/components/PrivacidadeDados.tsx` + `.module.css`;
  - `src/components/ConfirmarExclusao.tsx`;
  - `e2e/privacidade.spec.ts`.
- Modify: `src/lib/listas.ts` + teste (`montarExportacao`), `src/app/acoes.ts`, `src/app/minha-conta/page.tsx`, `src/components/Rodape.tsx`, `src/app/sitemap.ts`

**Interfaces:**
- Produces:
  - `type ExportacaoDados = { geradoEm: string; conta: { nome: string; email: string; criadaEm: string }; queroAssistir: { filmeId: number; desde: string }[]; assistidos: { filmeId: number; nota: Nota; desde: string }[]; vistosRecentemente: { filmeId: number; em: string }[]; buscasRecentes: { texto: string; em: string }[]; historicoLigado: boolean }`;
  - `montarExportacao(...)`, uma função pura que recebe as linhas do banco e devolve `ExportacaoDados` com datas em ISO;
  - `exportarDados(usuarioId)`;
  - `excluirConta(usuarioId)`: apaga `user`, e a cascata apaga o resto;
  - as ações `definirHistoricoAcao(ligado: boolean)` (ao desligar, apaga vistos e buscas), `apagarHistoricoAcao()` e `excluirContaAcao()`. Esta última chama primeiro `auth.api.signOut({ headers })`, para apagar o cookie, e depois `excluirConta`.

- [ ] **Passo 1: Teste que falha:** `montarExportacao` com uma linha de cada tipo devolve as chaves acima, datas `toISOString()` e nenhum campo de sessão ou token.
- [ ] **Passo 2:** FAIL, depois implemente, depois PASS.
- [ ] **Passo 3:** Telas:
  - `/privacidade`: os itens da seção "Privacidade" do spec, em português simples, com o contato `catalogostreamingof@gmail.com`. Entra no `sitemap` (prioridade 0,2) e ganha um link "Privacidade" no `Rodape`.
  - Na Minha conta, a seção "Privacidade e dados" (`PrivacidadeDados`) com:
    - a chave "Guardar meu histórico" (`role="switch"`, `aria-checked`), com o aviso "Ao desligar, seus vistos recentemente e buscas recentes são apagados.";
    - "Apagar histórico";
    - "Baixar meus dados" (link para `/api/eu/dados`, que responde `401` sem login e, com login, `Content-Disposition: attachment; filename="meus-dados-catalogo.json"`);
    - "Excluir minha conta", que abre `ConfirmarExclusao`: um `<dialog>` com `showModal()` (prende o foco e fecha com Esc), o texto "Isso apaga sua conta, suas listas e seu histórico. Não dá para desfazer." e os botões "Cancelar" e "Excluir para sempre". Ao confirmar, vai para `/` já sem login.
- [ ] **Passo 4:** e2e em `e2e/privacidade.spec.ts`:
  - `"desligar o histórico apaga e para de guardar"`;
  - `"baixar meus dados traz a lista"` (usar `page.request.get("/api/eu/dados")` e conferir o JSON);
  - `"baixar dados sem login dá 401"`;
  - `"excluir a conta apaga tudo e desconecta"`: depois de excluir, o topo mostra "Entrar" e `/minha-conta` redireciona para `/entrar`;
  - `"privacidade e minha conta sem violações sérias de acessibilidade"` (axe, como na Fase 2).
- [ ] **Passo 5:** Lint, testes, build e e2e: PASS.
- [ ] **Passo 6:** **Para o dono ver:** ler `/privacidade`, baixar os próprios dados e abrir o `.json`.
- [ ] **Passo 7:** Commit: `Privacidade e dados: histórico desligável, baixar dados, excluir conta`.

### Tarefa 9: Revisão final e publicação

**Files:**
- Modify: `CLAUDE.md` (Fase 3 concluída, variáveis de ambiente e comandos `db:*`), `README.md` (como preparar o banco localmente)

- [ ] **Passo 1:** Rode a revisão de segurança (`/security-review`) e uma revisão de código no ramo. Corrija o que for real.
- [ ] **Passo 2:** Confira, com o site ligado e **sem login**, que a página inicial não faz nenhum pedido ao banco. Como conferir: desligue a `DATABASE_URL` temporariamente com `npm.cmd run build && npm.cmd run start` e veja que o catálogo, a busca e a página do filme abrem normalmente, com "Entrar" no topo.
- [ ] **Passo 3:** Push do ramo. O dono abre o PR no GitHub. Espere o robô "Qualidade" ficar verde e a prévia da Vercel ficar pronta. Na prévia, o dono testa entrar com o Google. Se o proxy OAuth não funcionar, registre isso no PR e teste o login em produção depois do merge.
- [ ] **Passo 4:** Depois do merge, meça o Lighthouse do site publicado (celular 2× e computador 1×) e compare com a tabela do `CLAUDE.md`. Atualize a tabela.
- [ ] **Passo 5:** Commit: `Fase 3 concluída: documentação atualizada`. Ofereça atualizar a página "Bastidores do Catálogo".
