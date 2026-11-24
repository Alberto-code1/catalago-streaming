# Novo visual "Parede de pôsteres viva": Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** dar ao site o visual aprovado (parede de pôsteres viva, cor por streaming, troca "cascata + letreiro") sem mudar funções.

**Architecture:**
- **Cores:** tokens CSS em `globals.css`. Cada tema é ligado por `body:has([data-tema="<slug>"])`, sem JavaScript.
- **Parede e letreiro:** componentes de navegador que recebem do servidor as capas e a frase do serviço. Quando essas informações mudam (navegação pelos filtros), eles animam a troca. No primeiro carregamento não há animação.
- **"✓ visto":** vira uma única folha de estilo gerada no navegador.

**Tech Stack:** Next.js 16 (Cache Components), CSS Modules, next/font (Big Shoulders + Instrument Sans), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-24-visual-parede-design.md`

## Global Constraints
- Ramo `visual-parede`. Commits em português terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push e PR pelo dono.
- Nenhuma função muda. Todos os testes atuais continuam passando (só se ajustam seletores que dependem do visual).
- Contraste AA em todas as paletas. Foco visível. `prefers-reduced-motion`: nada se mexe e a troca é instantânea.
- Animação só com `transform`/`opacity`. Capas da parede em `w154`.
- Frases: todos → "hoje à noite"; netflix → "na Netflix"; prime → "no Prime Video"; disney → "no Disney+"; max → "na HBO Max"; globoplay → "no Globoplay".
- Primeira linha do título: "O que assistir". O `h1` lido pelos leitores de tela é a frase inteira (por exemplo, "O que assistir na Netflix").

## Review Focus
1. **Trocar de serviço rápido duas vezes seguidas:** a parede termina mostrando as capas do último serviço clicado, nunca uma mistura. Teste e2e na Tarefa 2.
2. **Movimento reduzido ativado:** a parede não desliza e a troca é instantânea. Teste e2e com `reducedMotion: "reduce"` na Tarefa 2.
3. **Serviço sem filmes:** a parede some e o título continua legível. Coberto pela lógica da Tarefa 2 (parede só renderiza com pelo menos 1 capa).
4. **Abrir a página do filme vindo de um serviço:** ela herda a cor. Teste e2e na Tarefa 1.
5. **Leitor de tela:** as letras do letreiro não são lidas uma a uma (o `h1` tem o texto inteiro e as letras ficam `aria-hidden`). Verificado com o axe na Tarefa 4.

---

### Tarefa 1: Cores por streaming e fontes
**Files:**
- Modify: `src/app/globals.css` (tokens, já começados), `src/app/layout.tsx` (fontes, já começadas), `src/app/page.tsx` e `src/app/filme/[id]/page.tsx` (marcador `<span data-tema hidden>`)
- Create: `src/lib/temas.ts`, `tests/temas.test.ts`, `e2e/visual.spec.ts`

**Interfaces:**
- Produces:
  - `type Tema = "todos" | "netflix" | "prime" | "disney" | "max" | "globoplay"`;
  - `temaDoServico(slug: string | undefined): Tema`;
  - `fraseDoTema(t: Tema): string`;
  - `<MarcaTema tema={Tema} />` (renderiza `<span data-tema hidden />`).

- [ ] Testes unitários: `temaDoServico("netflix")` dá `"netflix"`; `undefined` e `"xpto"` dão `"todos"`; `fraseDoTema` dá as 6 frases exatas. Rode e veja FAIL; implemente; veja PASS.
- [ ] e2e: `/?servico=netflix` deixa o `body` com `--destaque` = `#e50914` (`getComputedStyle`); `/filme/27205?servico=prime` tem `--destaque` = `#1fb4ec`.
- [ ] Lint, unitários, build e e2e: PASS. Commit: `Cores por streaming e fontes novas`.

### Tarefa 2: Parede de pôsteres e letreiro
**Files:**
- Create: `src/components/ParedePosteres.tsx` + `.module.css` (navegador), `src/components/Letreiro.tsx` (navegador), `src/components/Heroi.tsx` + `.module.css`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `temaDoServico` e `fraseDoTema`; `buscarFilmes` (o mesmo pedido do catálogo, já em cache).
- Produces:
  - `ParedePosteres({ capas: string[] })`: 3 fileiras com `data-testid="parede"`; ao receber capas novas, vira cada capa (atraso de 45 ms × posição) e troca a imagem no meio do giro; com movimento reduzido, troca na hora;
  - `Letreiro({ frase: string })`: letras `aria-hidden`, viram letra a letra quando a frase muda.

- [ ] e2e que falham:
  - a página inicial mostra o heading nível 1 "O que assistir hoje à noite";
  - clicar em Netflix faz o heading conter "na Netflix" e as capas da parede ficarem iguais às 20 primeiras capas da Netflix;
  - Netflix e Disney+ clicados em sequência mostram as capas da Disney+;
  - com `reducedMotion: "reduce"`, a fileira tem `animation-name: none`.
- [ ] Implemente o topo: o título fica fora do Suspense (é o maior elemento da tela e aparece na hora), e parede e letreiro ficam dentro do Suspense do catálogo.
- [ ] Lint, unitários, build e e2e: PASS. Commit: `Parede de pôsteres viva com cascata e letreiro`.

### Tarefa 3: Filtros, cartões e "✓ visto" numa peça só
**Files:**
- Modify: `FiltroServicos.module.css`, `CartaoFilme.tsx` + `.module.css`, `src/app/page.module.css`, `e2e/listas.spec.ts`
- Create: `src/components/EstiloVistos.tsx` (navegador)
- Delete: `src/components/MarcaVisto.tsx`

- [ ] e2e "filme assistido mostra ✓ visto" passa a esperar a marquinha escondida (`toBeHidden`) antes e visível depois. Rode e veja FAIL com a marquinha sempre presente.
- [ ] `CartaoFilme` ganha `data-filme={id}` e um `<span data-visto data-testid="marca-visto">✓ visto</span>` escondido. `EstiloVistos`, montado no layout, gera `[data-filme="<id>"] [data-visto]{display:inline-flex}` a partir do estado pessoal.
- [ ] Visual: pílulas maiores (a ativa preenchida com `--destaque`), cartão que sobe e inclina com brilho `--destaque` ao passar o mouse ou focar, "Populares agora" na fonte de títulos.
- [ ] Lint, unitários, build e e2e: PASS. Commit: `Cartões e filtros no novo visual; ✓ visto numa peça só`.

### Tarefa 4: Acabamento e medição
- [ ] Página do filme, busca, Minha conta, Entrar e Privacidade com títulos na fonte nova. Conferir as 6 paletas no navegador (prints).
- [ ] axe sem violações sérias na home de cada tema (e2e).
- [ ] Lighthouse na prévia ou no site: celular 2× e computador 1×.
- [ ] Commit, push e PR.
