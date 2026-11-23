# Catálogo Streaming, Fase 2: busca por nome e filtro por gênero (design)

**Data:** 2026-11-23
**Status:** aprovado em 2026-11-23
**Depende de:** Fase 1 (`docs/superpowers/specs/2026-11-22-catalogo-streaming-design.md`), concluída e no ar em https://catalogo-streaming-one.vercel.app

## 1. Intenção e o porquê

O site é um **projeto de estudo**. O dono é iniciante e está aprendendo a usar o Claude Code, com a meta de, no futuro, construir produtos que gerem renda. A Fase 2 acrescenta as duas funções que ficaram de fora da Fase 1, como combinado:

1. **Busca por nome:** a pessoa digita o título e descobre se o filme está nos streamings do Brasil.
2. **Filtro por gênero:** a pessoa navega pelo catálogo escolhendo um gênero, combinado com o serviço.

O processo continua o mesmo da Fase 1: etapas pequenas, cada uma com algo visível no navegador e explicação em português simples.

## 2. Objetivos

- Botão **"Gênero ▾"** na página inicial, ao lado dos botões de serviço. Ele abre a lista de gêneros do TMDB em português, mais a opção "Todos os gêneros".
- O gênero **combina** com o serviço (ex.: Netflix + Comédia) e com o "Carregar mais".
- O gênero fica no endereço: `/?servico=netflix&genero=35` (35 é o id do TMDB). Um link compartilhado abre com os mesmos filtros.
- O "← Voltar ao catálogo" da página do filme mantém **serviço e gênero**.
- Caixa **"🔍 Buscar filme…"** no topo de todas as páginas. Ao apertar Enter, abre `/busca?q=<texto>`.
- A página **"Resultados para '<texto>'"** mostra até **20** resultados, cada um com um selo:
  - disponível: "✓ HBO Max, Prime Video";
  - não disponível: cartão "apagado" e o selo "Indisponível".
- **"Disponível" vale só para os 5 serviços do site** (Netflix, Prime Video, Disney+, HBO Max e Globoplay, os mesmos de `SERVICOS`), por assinatura, grátis ou com anúncios, no Brasil. Decisão do dono (2026-11-23): manter a busca coerente com o catálogo. Se a busca diz "disponível", o filme está num dos botões do site.
  - Os nomes no selo vêm de `SERVICOS` ("Prime Video", "HBO Max"), não do TMDB.
  - A correspondência é feita pelo `providerId` exato de cada serviço (8, 119, 337, 1899, 307).
  - Outros serviços (Pluto TV, MUBI etc.) não contam para o selo nem para a ordem. A página do filme continua mostrando todos os serviços do Brasil, como na Fase 1.
- Ordem dos resultados: **disponíveis primeiro**; dentro de cada grupo, a ordem de relevância do TMDB.

## 3. Fora de escopo (não-objetivos)

- Filtrar a **busca** por serviço ou gênero. A API de busca do TMDB não aceita esses filtros, então a página de busca não mostra esses botões.
- "Carregar mais" na busca. Mostram-se os 20 mais relevantes. Se o TMDB tiver mais, aparece: "Mostrando os 20 mais relevantes. Tente um nome mais específico."
- Sugestões enquanto digita (autocompletar).
- Vários gêneros ao mesmo tempo.
- Os itens menores adiados na revisão da Fase 1 (404 geral em português, timeout do TMDB etc.). Ficam para outra conversa.
- Login e banco de dados (Fase 3).

## 4. Anti-objetivos

- Busca que mostra erro técnico, ou fica em branco, quando o TMDB falha numa das consultas de "onde está". Uma falha num filme não pode derrubar a busca inteira.
- Filtros que se "esquecem" um do outro. Escolher um gênero não pode apagar o serviço escolhido, e escolher um serviço não pode apagar o gênero.
- Código que o dono não consegue acompanhar.

## 5. Restrições

- **Mesma base da Fase 1:** Next.js 16 (Cache Components ligado: `"use cache"` + `cacheLife`; `params` e `searchParams` são Promises e são lidos dentro de `<Suspense>`), TypeScript, CSS Modules, Vitest, Playwright, chamadas ao TMDB só no servidor (`import "server-only"`) e token em `TMDB_READ_TOKEN`.
- **Valores que vêm de fora são conferidos:**
  - gênero desconhecido (`?genero=abc` ou um id que não está na lista do TMDB) → "Todos os gêneros";
  - busca com menos de 2 letras (depois de tirar os espaços) → não chama o TMDB e mostra "Digite pelo menos 2 letras";
  - busca com mais de 100 caracteres → cortada em 100.
- **TMDB:**
  - Gêneros: `GET /genre/movie/list?language=pt-BR` (cache longo: `cacheLife("days")`).
  - Catálogo com gênero: o mesmo `/discover/movie` da Fase 1, com o parâmetro `with_genres=<id>` a mais.
  - Busca: `GET /search/movie?query=<texto>&language=pt-BR&include_adult=false&page=1`.
  - Onde está, por filme: `GET /movie/{id}/watch/providers` → `results.BR` (`flatrate`, `free`, `ads`), reaproveitando `extrairOndeAssistir` da Fase 1. As até 20 consultas rodam **em paralelo** (`Promise.all` ou similar), cada uma com cache (`cacheLife("hours")`).
  - Se a consulta de "onde está" de **um** filme falhar, esse filme aparece sem selo (neutro), e o resto da busca segue normal.
  - Se a **lista de gêneros** falhar, nada quebra (decisão do Claude): o botão "Gênero" some, `?genero=` é ignorado no catálogo e no "Carregar mais", e os filmes aparecem normalmente.
- **SEO:** as páginas de busca recebem `robots: { index: false }`, porque o Google não deve indexar páginas de busca. Título da aba: `Busca: <texto> · Catálogo Streaming`.
- **Acessibilidade:** o campo de busca tem rótulo (pode ser visualmente escondido). O "Gênero ▾" é operável por teclado, e o gênero ativo é indicado para leitores de tela. O robô axe (e2e) continua sem violações sérias.

## 6. Abordagens consideradas (botão "Gênero ▾")

| Abordagem | A favor | Contra |
|---|---|---|
| **1. `<details>`/`<summary>` com uma lista de links** ✅ | Sem JavaScript; cada gênero é um link, como os filtros de serviço; o Google segue os links | Exige cuidado para ficar 100% acessível |
| 2. `<select>` nativo | Os leitores de tela entendem muito bem | Precisa de JavaScript para navegar ao escolher; visual difícil de deixar igual ao resto do site |
| 3. Menu próprio em JavaScript | Controle total do visual | Mais trabalho e mais fácil errar na acessibilidade |

**Escolhida: 1**, por decisão do Claude (o dono delegou a escolha). Mantém o padrão "filtros são links" da Fase 1.

A busca é um `<form action="/busca" method="get">` comum, sem JavaScript. A página de resultados é montada no servidor.

## 7. Como funciona (decidido)

### Gênero
- A lista de gêneros do TMDB é carregada e guardada em cache.
- `?genero=<id>` só é aceito se o id estiver na lista. Senão, vale "Todos os gêneros".
- O texto do botão mostra o gênero atual: "Gênero ▾" (todos) ou "Gênero: Comédia ▾".
- Os **links dos serviços preservam o gênero** e os **links dos gêneros preservam o serviço**.
- O "Carregar mais" e a rota `/api/filmes` passam a aceitar e repassar `genero`.
- O `key` do "Carregar mais" passa a considerar serviço **e** gênero, para recomeçar ao trocar qualquer um dos dois.
- Os cartões levam serviço e gênero para a página do filme, e o "← Voltar ao catálogo" volta com os dois.
  - O link "Voltar" **não** consulta o TMDB (decisão do Claude): ele repassa `genero` desde que seja um número inteiro positivo, e a página inicial faz a validação completa.
- Lista vazia com filtros: "Nenhum filme encontrado com estes filtros."
- A tela de carregamento (esqueleto) do filtro ganha mais uma "pílula" para o botão de gênero.

### Busca
- A caixa fica no topo (componente `Topo`), à direita, antes do "Sobre". No celular, ocupa a largura disponível.
- Na página de busca, a caixa já vem preenchida com o texto buscado.
- Resultados: grade igual à do catálogo, com o mesmo cartão, mais o selo abaixo do ano.
  - Disponível: o selo verde lista até 3 serviços e depois "+N".
  - Não disponível: cartão com opacidade reduzida e o selo cinza "Indisponível" (texto escolhido pelo dono).
  - Sem informação (falha): sem selo.
- Os cartões da busca levam à página do filme **sem** filtros (o "Voltar" vai para `/`).
- Estados da página:
  - `q` vazio ou com 1 letra → "Digite pelo menos 2 letras para buscar.";
  - nenhum resultado → "Nenhum filme encontrado para '<texto>'.";
  - erro do TMDB na busca em si → a tela de erro amigável que já existe;
  - mais de 20 resultados → a frase do item 3.
- Enquanto carrega: esqueleto da grade.

## 8. Testes esperados

- **Unitários (Vitest):**
  - montagem do discover com gênero;
  - leitura e validação do gênero;
  - montagem dos links preservando serviço e gênero;
  - normalização do texto de busca (espaços, mínimo de 2 e máximo de 100);
  - ordenação "disponíveis primeiro" mantendo a relevância;
  - texto do selo ("✓ A, B, C +2" / "Indisponível"), contando só os 5 serviços e com os nomes de `SERVICOS`.
- **Ponta a ponta (Playwright):**
  - escolher um gênero muda a URL e mantém o serviço;
  - Netflix + gênero e depois "Voltar" do filme mantêm os dois;
  - buscar um título conhecido mostra resultados com selo;
  - buscar 1 letra mostra o aviso;
  - busca sem resultado mostra a mensagem;
  - a busca continua sem violações sérias de acessibilidade.

## 9. Decisões tomadas pelo Claude (o dono pode revisar)

- Botão de gênero com `<details>` e uma lista de links (o dono delegou a escolha da técnica).
- Até 20 resultados na busca, sem "carregar mais"; disponíveis primeiro.
- Buscas com menos de 2 letras não rodam; o texto é limitado a 100 caracteres.
- Páginas de busca fora do Google (`noindex`).
- (Texto do selo dos não disponíveis definido pelo dono: "Indisponível".)
- Falha na lista de gêneros: o botão some e nada quebra. O "Voltar" repassa o gênero sem consultar o TMDB.

## 10. Fica a critério de quem constrói

- Nomes de arquivos e funções, seguindo os padrões da Fase 1 (lógica pura em `src/lib` com testes; telas em `src/components` e `src/app`).
- O visual exato do selo e da lista de gêneros, dentro do tema da prévia aprovada (`.superpowers/brainstorm/2386-1795438839/content/fase2-v1.html`, opção B).
- A ordem das etapas do plano, desde que cada uma termine com algo visível e o dono receba uma explicação.
