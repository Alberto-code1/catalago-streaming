# Catálogo Streaming — Design

**Data:** 2026-11-22
**Status:** aprovado em 2026-11-22

## 1. Intenção e o porquê

Um site que mostra os filmes que estão disponíveis **agora** nos serviços de streaming no Brasil, usando a API do TMDB.

O site é um **projeto de treino**. O dono é iniciante (sabe só um pouco de Python) e quer:

1. Aprender a usar o Claude Code de verdade: pedir, revisar, testar, ajustar e publicar.
2. Aprender um jeito de construir que sirva depois para produtos que gerem renda.
3. Mais tarde, num projeto separado, aprender sobre agentes de IA. Este site pode servir de base para isso, por exemplo com um agente que recomenda filmes, mas isso está **fora** deste design.

**Consequência para a construção:** cada etapa precisa ser pequena, ter um resultado visível no navegador e ser explicada em português simples. O código deve ficar fácil de ler. Clareza vale mais que esperteza.

## 2. Objetivos

- Página inicial com uma grade de filmes disponíveis no Brasil, inclusos na assinatura ou grátis, ordenados por popularidade.
- Filtro por serviço com botões no topo: Todos, Netflix, Prime Video, Disney+, Max e Globoplay.
- Botão "Carregar mais filmes", que busca a próxima página.
- Página de cada filme com capa, título, ano, nota, duração, gêneros, sinopse, onde assistir, trailer e elenco principal.
- Site publicado na internet com um link público (Vercel, plano gratuito).
- Chave da API do TMDB **nunca** exposta no navegador.
- Código versionado com Git desde o início.
- **Acabamento profissional** (acrescentado em 2026-11-22, quando o dono pediu "um site completo, considerado o ideal atualmente", para aprender o que um site sério precisa ter). Detalhes na seção 7, em "Acabamento profissional".

## 3. Fases e fora de escopo

O dono aprovou construir em fases. Cada fase termina com o site no ar e funcionando. **Este design cobre a Fase 1.** As fases 2 e 3 terão designs próprios.

- **Fase 1 (este documento):** catálogo, filtros, carregar mais, página do filme, publicação e acabamento profissional.
- **Fase 2:** busca por nome e filtro por gênero. A caixa de busca aparece na prévia só como "versão futura" e **não** entra na Fase 1.
- **Fase 3:** login e contas, banco de dados, lista "quero assistir" e página de privacidade/LGPD.

Fora de escopo em todas as fases planejadas, por enquanto:
- Séries de TV.
- Escolha de país (fixo no Brasil).
- Qualquer agente de IA.
- Monetização. Os termos gratuitos do TMDB proíbem uso comercial.

## 4. Anti-objetivos (seria um fracasso mesmo que funcionasse)

- Código grande ou "mágico" que o dono não consegue acompanhar nem explicar.
- Chave da API visível no navegador ou salva no Git.
- Construir tudo de uma vez, sem etapas visíveis e explicadas.
- Faltar o crédito ao TMDB e ao JustWatch (exigido pelos termos).

## 5. Restrições

- **Dados:** API do TMDB v3 (https://developer.themoviedb.org/docs/getting-started). O dono ainda precisa criar a conta e a chave. Isso vira uma etapa guiada do plano.
- **Região e disponibilidade:** `watch_region=BR` e `with_watch_monetization_types=flatrate|free|ads` (assinatura, grátis e grátis com anúncios). Filmes só para aluguel ou compra ficam de fora.
- **Limite do TMDB:** cada busca do discover vai até a página 500 (cerca de 10 mil filmes). O "carregar mais" para quando acabarem as páginas.
- **Atribuição:** rodapé em todas as páginas com "Dados de filmes: TMDB · Onde assistir: JustWatch", com o logo ou link do TMDB conforme as regras de marca deles.
- **Idioma:** interface em português; dados pedidos com `language=pt-BR`.
- **Ambiente:** Windows 11, Node.js 26, Git 2.56 já instalados. Editor: VS Code com a extensão do Claude Code.
- **Custo:** zero. Plano gratuito do TMDB e da Vercel.

## 6. Abordagens consideradas

| Abordagem | A favor | Contra |
|---|---|---|
| A. HTML/CSS/JS puro chamando o TMDB pelo navegador | Mais simples; nada para instalar | Chave exposta; não cresce bem; não é como produtos reais são feitos |
| **B. Next.js publicado na Vercel** ✅ | Chave fica no servidor; ferramenta usada em produtos reais; publicação grátis e simples | Mais peças para entender no começo |
| C. Python (Flask) | Aproveita o Python básico do dono | Publicação grátis mais chata; telas ricas dão mais trabalho |

**Escolhida: B.** O dono escolheu porque quer ter renda no futuro, e essa combinação é usada para lançar produtos web de verdade.

## 7. Como funciona (decidido)

### Tecnologia
- Next.js (versão estável atual) com App Router e TypeScript, criado com `create-next-app`.
- As chamadas ao TMDB acontecem **no servidor**, em Server Components ou funções de servidor. A chave fica numa variável de ambiente (`TMDB_API_KEY` ou o token "Read Access", `TMDB_READ_TOKEN`) no arquivo `.env.local`, que fica fora do Git. Na Vercel, ela é cadastrada nas configurações do projeto.
- Imagens (capas, fundos e fotos) vêm do CDN de imagens do TMDB (`image.tmdb.org`).

### Página inicial (`/`)
- Busca: `GET /discover/movie` com `watch_region=BR`, `with_watch_monetization_types=flatrate|free|ads`, `sort_by=popularity.desc`, `language=pt-BR`, `page=N`, e com `with_watch_providers=<id>` quando um serviço está selecionado. Em "Todos", usar os IDs dos 5 serviços separados por `|` (OU), para mostrar só filmes desses serviços.
- Os IDs dos serviços no Brasil devem ser **confirmados** em `GET /watch/providers/movie?watch_region=BR`. Exemplo: a Max tem IDs novo e antigo, então confira qual retorna resultados.
- O serviço escolhido fica na URL (`/?servico=netflix`), para o link poder ser compartilhado e o botão voltar funcionar.
- Cartão: capa, nota (⭐ com uma casa decimal), título e ano. Com um serviço selecionado, o cartão mostra o selo desse serviço. Em "Todos", o cartão fica sem selo, porque o discover não informa em qual serviço cada filme está e buscar isso filme a filme deixaria a página lenta. Essa é uma diferença pequena em relação à prévia.
- Filme sem capa: mostrar um bloco com o título no lugar.
- "Carregar mais filmes" adiciona a próxima página abaixo das que já estão na tela.

### Página do filme (`/filme/[id]`)
- Uma chamada: `GET /movie/{id}?language=pt-BR&append_to_response=videos,credits,watch/providers`.
- **Sinopse:** em pt-BR; se vier vazia, buscar em `en-US`.
- **Onde assistir:** `watch/providers` → `results.BR`, mostrando os serviços de `flatrate`, `free` e `ads`, com o logo de cada um.
- **Trailer:** o primeiro vídeo do YouTube com `type=Trailer` em pt-BR; se não houver, em inglês (`include_video_language=pt,en` ou uma segunda chamada); se não houver nenhum, a seção não aparece. Embutido com o player do YouTube.
- **Elenco:** os 10 primeiros de `credits.cast`, com foto (ou iniciais, se não houver foto), nome e personagem.
- Imagem de fundo do topo: `backdrop_path` com um degradê por cima; se não existir, só o degradê.
- Link "← Voltar ao catálogo".

### Visual
- Tema escuro, igual à prévia aprovada (`.superpowers/brainstorm/1908-1795364631/content/telas-v1.html`): fundo quase preto, destaque amarelo (#f5c518) no filtro ativo e na nota, cartões com cantos arredondados e um leve "levantar" ao passar o mouse.
- Precisa funcionar bem no celular: a grade se ajusta à largura da tela.

### Erros e casos vazios
- TMDB fora do ar ou chave errada: mensagem amigável em português ("Não foi possível carregar os filmes agora. Tente de novo em instantes.") em vez de tela quebrada.
- Filtro sem resultados: "Nenhum filme encontrado para este serviço."
- ID de filme inexistente: página "Filme não encontrado" com link de volta.

### Acabamento profissional (Fase 1)
- **SEO e compartilhamento:** título e descrição em toda página. Open Graph (imagem, título e descrição) para o link ficar bonito no WhatsApp e nas redes. Na página do filme, a imagem é o fundo ou a capa do filme; na inicial, uma imagem padrão do site. Inclui `sitemap.xml` e `robots.txt`.
- **Acessibilidade:** textos alternativos nas imagens, foco visível ao navegar por teclado, filtro ativo indicado para leitores de tela (`aria-current`), título no iframe do trailer, um link "pular para o conteúdo" e contraste adequado. Meta: nota **≥ 90** de Acessibilidade no Lighthouse.
- **Carregamento:** "esqueletos" (blocos cinzas animados) enquanto a página inicial e a do filme carregam.
- **Desempenho e estatísticas:** imagens no tamanho certo, Vercel Analytics e Vercel Speed Insights. Meta: Lighthouse **≥ 90** em Desempenho, Boas Práticas e SEO no computador, e **≥ 80** em Desempenho no celular. O Vercel Analytics não usa cookies, então a Fase 1 não precisa de aviso de cookies.
- **Robô de qualidade (CI):** GitHub Actions roda lint, testes, build e testes de ponta a ponta a cada push e pull request. O token do TMDB fica nos Secrets do repositório.
- **Teste de ponta a ponta:** Playwright abre o site e confere o fluxo principal: grade carrega, filtro muda a URL, "carregar mais" adiciona filmes, a página do filme abre e um id inválido mostra "não encontrado".
- **Identidade:** ícone na aba (favicon) e página `/sobre`, que conta o que é o projeto, dá os créditos ao TMDB e ao JustWatch e avisa que é um projeto de estudo, sem fins comerciais.

### Processo (parte do aprendizado)
- Git iniciado logo no começo, com commits pequenos a cada etapa e mensagens claras em português.
- **GitHub:** o dono já tem conta. Logo após criar o projeto, criar um repositório no GitHub (de preferência privado, decisão do dono no momento), ligar ao repositório local e enviar o código (`push`) ao fim de cada etapa.
- **Publicação:** a Vercel é ligada ao repositório do GitHub. Cada `push` na branch principal publica o site sozinho. A variável `TMDB_READ_TOKEN` é cadastrada no painel da Vercel.
- `.gitignore` deve incluir `.env*.local` e `.superpowers/`.
- Cada etapa do plano termina com algo que o dono consegue ver no navegador e uma explicação curta do que foi feito e por quê.
- Ordem sugerida das etapas: (1) criar o projeto, ver a página padrão rodando e enviar ao GitHub; (2) conta e chave do TMDB, com a chave guardada com segurança; (3) grade de filmes populares; (4) filtros por serviço; (5) carregar mais; (6) página do filme; (7) erros e casos vazios; (8) carregamento e acessibilidade; (9) SEO e identidade; (10) testes de ponta a ponta; (11) ligar a Vercel ao GitHub, publicar e ativar as estatísticas; (12) robô de qualidade e medição no Lighthouse.
- Um `CLAUDE.md` no projeto explicando o contexto (iniciante, explicar em português, etapas pequenas) para as próximas sessões do Claude Code.

## 8. Decisões tomadas pelo Claude (o dono pode revisar)

- **Onde assistir** mostra **todos** os serviços brasileiros que tenham o filme na assinatura ou grátis, não só os 5 dos filtros. É mais útil e não dá trabalho extra.
- **Voltar da página do filme** leva ao catálogo com o filtro mantido, mas de volta à primeira página de resultados. Guardar a posição do "carregar mais" fica para uma versão futura.
- **Autenticação no TMDB:** usar o token "API Read Access Token" no cabeçalho `Authorization: Bearer`, em `TMDB_READ_TOKEN`. É o método recomendado atualmente pelo TMDB.

## 9. Fica a critério de quem constrói

- Estrutura exata de pastas e nomes de componentes (mantendo simples).
- Estilização: CSS Modules ou Tailwind. Prefira o que deixar o código mais legível para um iniciante.
- Cache das respostas do TMDB (o padrão do Next.js com `revalidate` de algumas horas basta).
- Testes: poucos e simples. Pelo menos as funções que montam a busca do TMDB e escolhem o trailer e a sinopse. O foco é o dono ver que testes existem e para que servem, não cobertura alta.
- Como implementar o "carregar mais" (componente de cliente chamando uma rota do próprio site, que chama o TMDB).
