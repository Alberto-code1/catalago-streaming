# Catálogo Streaming, Fase 3: contas, listas e histórico (design)

**Data:** 2026-11-23
**Status:** aprovado em 2026-11-23
**Depende de:** Fases 1 e 2, concluídas e no ar em https://catalogo-streaming-one.vercel.app

## 1. Intenção e o porquê

O site é um **projeto de estudo**. O dono é iniciante e está aprendendo a usar o Claude Code, com a meta de, no futuro, construir produtos que gerem renda. Login e banco de dados são a base de quase todo produto, e a Fase 3 serve para ele aprender isso num site que já conhece.

A ideia do dono: **a pessoa entra no site e encontra suas coisas salvas**. Ele escolheu quatro funções:

1. **Quero assistir:** uma lista de filmes para ver depois.
2. **Já assisti:** filmes marcados como vistos, com uma nota opcional 👍/👎. É o "histórico" em que ele pensou.
3. **Vistos recentemente:** os filmes que a pessoa abriu no site.
4. **Buscas recentes:** aparecem ao clicar na caixa de busca.

O site é aberto a **qualquer visitante**, e por isso entra também a parte da **LGPD** (página de privacidade, baixar os dados, excluir a conta).

O processo continua o mesmo: etapas pequenas, cada uma com algo visível no navegador e explicação em português simples. O trabalho é feito num ramo, com Pull Request (prévia da Vercel e robô "Qualidade") antes de juntar na `main`.

## 2. Objetivos

### Entrar e sair
- Entrada **só com a conta do Google** (decisão do dono). O site não guarda senhas.
- No topo, à direita: **"Entrar"** para quem não está logado. Para quem está logado, a foto (ou a inicial) com o menu **"Minha conta"** e **"Sair"**.
- Quem não está logado e clica em "Quero assistir" ou "Já assisti" vai para a entrada pelo Google e depois **volta para o mesmo filme**. Decisão do Claude: a ação não é refeita sozinha na volta, a pessoa clica de novo.

### Página do filme
- Dois botões abaixo de "Onde assistir":
  - **"+ Quero assistir"** / **"✓ Na sua lista"**: clicar de novo tira o filme da lista.
  - **"Já assisti"** / **"✓ Assistido"**: clicar de novo desmarca.
- Depois de "Já assisti" aparecem **👍 / 👎**. A nota é opcional, e clicar de novo na mesma nota a apaga.
- Marcar "Já assisti" **tira o filme da lista "Quero assistir"** (decisão do Claude, aceita pelo dono).
- Para quem está logado, abrir a página registra o filme em **"Vistos recentemente"**, se o histórico estiver ligado.

### Catálogo e busca
- Os cartões dos filmes já assistidos ganham uma marquinha **"✓ visto"**. Eles **não somem** (decisão do Claude, aceita pelo dono). Isso vale para a página inicial, o "Carregar mais" e a busca.
- Os cartões **não** ganham os botões de lista (decisão do Claude). Os botões ficam só na página do filme, para os cartões não ficarem poluídos.
- Ao clicar na caixa de busca, uma pessoa logada vê as **últimas 5 buscas**. Clicar numa busca refaz a pesquisa, cada busca tem um "×" para apagá-la e há um "Apagar todas".
- A busca é registrada quando a página `/busca` mostra resultados para um texto válido (2 letras ou mais).

### Minha conta (`/minha-conta`)
- Três abas (links com `?aba=`):
  - **Quero assistir**, a mais recente primeiro;
  - **Já assisti**, com o 👍/👎 de cada filme;
  - **Vistos recentemente**, os últimos 20.
- Cada filme da lista mostra capa, título, ano e o selo de **onde está agora** (o mesmo selo da busca, só com os 5 serviços do site), mais um botão para remover.
- Cada aba vazia tem uma frase de orientação. Exemplo: "Sua lista está vazia. Abra um filme e toque em '+ Quero assistir'."
- Uma seção **"Privacidade e dados"** com:
  - a chave **"Guardar meu histórico"** (vistos recentemente e buscas). Começa ligada. Ao desligar, o histórico antigo **é apagado** e nada novo é guardado;
  - **"Apagar histórico"**;
  - **"Baixar meus dados"**: um arquivo `.json` com conta, listas e histórico;
  - **"Excluir minha conta"**: pede confirmação numa caixa da própria página (não um `confirm()` do navegador), apaga tudo e desconecta.
- Quem não está logado e abre `/minha-conta` vai para a entrada pelo Google.

### Privacidade (`/privacidade`)
- Página em português simples explicando:
  - quais dados são guardados: nome, e-mail e foto vindos do Google, as listas e o histórico;
  - para que servem: só para as funções do site. Nada é vendido nem compartilhado, e não há anúncios;
  - onde ficam: Vercel e Neon, com servidores possivelmente fora do Brasil;
  - quanto tempo ficam guardados: até a pessoa apagar ou excluir a conta;
  - os direitos da pessoa (ver, baixar, corrigir, apagar) e como exercê-los na própria Minha conta;
  - o cookie de sessão, que é essencial para o login. A Vercel Analytics, que o site já usa, não usa cookies;
  - quem é o responsável ("o responsável pelo Catálogo Streaming, um projeto pessoal") e o e-mail de contato **catalogostreamingof@gmail.com** (decisão do dono; o mesmo e-mail serve de suporte na tela de consentimento do Google).
- Link para essa página no rodapé e na tela de entrada.

## 3. Fora de escopo (não-objetivos)

- Outras formas de entrar (link por e-mail, senha, GitHub). O link por e-mail exige um domínio próprio e pode vir depois.
- Ideias que ficaram para uma possível Fase 4: "Meus streamings", gêneros favoritos ("Para você"), aviso "chegou no seu streaming", compartilhar a lista.
- Listas e histórico **sem login** (guardados no navegador).
- Editar o nome ou a foto. Eles vêm do Google e se corrigem lá.
- Nota em estrelas ou resenha escrita.
- Painel de administrador.

## 4. Anti-objetivos

- **O catálogo ficar mais lento para quem não está logado.** Não pode piorar as notas atuais (Lighthouse 100 no computador e 91–98 no celular). A parte que muda por pessoa carrega depois do resto, sem atrasar a página.
- Uma pessoa ver ou mexer nos dados de outra.
- Segredos (`BETTER_AUTH_SECRET`, segredo do Google, endereço do banco) no Git ou em código que vai para o navegador.
- Dados guardados "para sempre" sem a pessoa conseguir apagar, ou a exclusão da conta deixar restos (listas ou histórico órfãos).
- Uma falha no banco de dados derrubar o catálogo. Se o banco cair, o catálogo e a página do filme continuam funcionando, só sem as partes pessoais.
- Código que o dono não consegue acompanhar.

## 5. Restrições

- **Mesma base das fases anteriores:** Next.js 16 com Cache Components (`cacheComponents: true` e `partialPrefetching: true` no `next.config.ts`), TypeScript, CSS Modules, Vitest e Playwright. Chamadas ao TMDB só no servidor (`import "server-only"`).
- **Leitura da sessão com Cache Components:** seguir `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`:
  - ler a sessão sempre dentro de `<Suspense>`, nunca no topo de um layout;
  - centralizar a leitura da sessão e do banco numa "camada de acesso a dados" (`src/lib/...` com `server-only`);
  - toda ação que altera dados confere de novo quem é a pessoa no servidor.
- **Banco:** Postgres da **Neon**, ativado pela integração da Vercel (Marketplace), plano gratuito (decisão do dono). Prévias de Pull Request usam um **ramo do banco** separado (recurso da integração), para nunca mexer nos dados reais (decisão do Claude).
- **Login:** biblioteca **Better Auth** com o provedor Google (está na lista oficial de bibliotecas do guia de autenticação do Next.js). A versão exata e o jeito de ligá-la ao banco, por exemplo com Drizzle, são conferidos na documentação da época, pela compatibilidade com Next 16 e React 19.
- **Variáveis de ambiente** (só em `.env.local` e na Vercel): `DATABASE_URL` (criada pela integração), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`. Os arquivos que as usam começam com `import "server-only"`.
- **Google:** o dono cria o cliente OAuth no Google Cloud Console, guiado passo a passo. Pedimos só nome, e-mail e foto (escopos básicos), que não exigem verificação do Google. A tela de consentimento precisa ser **publicada (modo produção)**. No modo teste, só 100 contas listadas conseguem entrar.
- **Login nas prévias da Vercel:** o Google só aceita endereços de retorno cadastrados, e cada prévia tem um endereço diferente. Usar o recurso da Better Auth para prévias (plugin de proxy OAuth), se ele funcionar com a versão escolhida. Se não funcionar, o login é testado em `localhost` e no site oficial, e a prévia testa o resto. (Decisão do Claude.)
- **O que fica guardado de cada filme:** só o **id do TMDB**. Título, capa e "onde está" vêm do TMDB na hora, com o cache que já existe. Assim o banco guarda o mínimo (bom para a LGPD) e nada fica desatualizado.
- **Limites** (decisão do Claude): até 500 filmes em "Quero assistir" e 2.000 em "Já assisti". "Vistos recentemente" guarda 20 e as buscas guardam 5: as mais antigas saem sozinhas. Um filme repetido sobe para o topo em vez de duplicar. Uma busca repetida, sem diferença de maiúsculas e minúsculas, sobe para o topo.
- **Valores que vêm de fora são conferidos no servidor:** o id do filme é um inteiro positivo; a nota é só "gostei", "não gostei" ou nenhuma; o texto da busca passa pela mesma limpeza da Fase 2 (de 2 a 100 caracteres).
- **Testes de ponta a ponta sem o Google:** o robô não consegue entrar com uma conta Google de verdade. Precisa de um jeito de entrar como "pessoa de teste" que **só existe quando uma variável de teste está ligada** e que é impossível de ativar em produção. O `build` de produção deve falhar, ou a rota responder 404, se ela estiver presente.
- **SEO:** `/minha-conta` e a tela de entrada ficam com `noindex`. `/privacidade` pode ser indexada e entra no `sitemap`.
- **Acessibilidade:**
  - os botões de lista usam `aria-pressed`, ou um texto que muda, para os leitores de tela;
  - o menu da conta e a lista de buscas recentes funcionam com teclado e fecham com Esc (como a lista de gêneros);
  - a caixa de confirmação de exclusão prende o foco enquanto está aberta;
  - o robô axe continua sem violações sérias.

## 6. Abordagens consideradas

### Forma de entrar

| Abordagem | A favor | Contra |
|---|---|---|
| **1. Só Google** ✅ | Um clique para quem visita; o site não guarda senha; menos coisa sensível | Quem não tem Google não entra (raro no Brasil); cadastro no painel do Google |
| 2. Link por e-mail | Funciona com qualquer e-mail, sem senha | Exige domínio próprio para mandar e-mail a qualquer pessoa (`vercel.app` não serve) |
| 3. E-mail e senha | Familiar | Precisa de "esqueci a senha" (mesmo problema do e-mail) e de guardar senhas com segurança |

**Escolhida: 1**, pelo dono.

### Banco de dados

| Abordagem | A favor | Contra |
|---|---|---|
| **Neon (Postgres) pela Vercel** ✅ | Grátis; ligado ao site com poucos cliques; "cochila" mas acorda sozinho (menos de 1 s); ramos de banco para as prévias | Login fica por conta de uma biblioteca (Better Auth) |
| Supabase | Login e banco juntos, painel visual | No plano grátis, pausa após 7 dias sem uso e precisa ser religado à mão |

**Escolhido: Neon**, pelo dono, depois da explicação sobre "dormir".

### Biblioteca de login
Better Auth (decisão do Claude): está no guia oficial, guarda as contas no nosso próprio Postgres e tem o provedor Google pronto. As alternativas foram descartadas: Clerk guarda os dados num serviço de fora e tem limites; Auth.js já foi absorvida pela Better Auth; fazer o login do zero é mais arriscado.

## 7. Como funciona (decidido)

### Dados guardados
- **Tabelas da Better Auth:** usuário (nome, e-mail, foto), sessão e conta vinculada ao Google.
- **Quero assistir:** pessoa, id do filme, data. Cada filme aparece uma vez por pessoa.
- **Já assisti:** pessoa, id do filme, nota (gostei / não gostei / nenhuma), data. Cada filme aparece uma vez por pessoa.
- **Vistos recentemente:** pessoa, id do filme, data da última visita. Uma linha por filme; guarda os 20 mais recentes.
- **Buscas recentes:** pessoa, texto, data. Guarda as 5 mais recentes.
- **Preferência:** "guardar histórico" (sim/não), junto do usuário.
- Excluir a conta apaga **tudo** isso (exclusão em cascata no banco).

### Partes pessoais sem atrasar as páginas
- O catálogo, a busca e a página do filme continuam montados como hoje (cache e páginas prontas).
- As partes pessoais (botão "Entrar" ou foto, botões da página do filme, marquinhas "✓ visto", buscas recentes) carregam **depois**:
  - em `<Suspense>` lendo a sessão no servidor, ou
  - por um pedido pequeno do navegador, por exemplo "quais destes ids eu já assisti?".
- O registro de "vistos recentemente" acontece sem atrasar a página do filme e só para quem está logado com o histórico ligado.
- Quem não está logado não dispara nenhuma consulta ao banco nas páginas do catálogo.

### Ações
- Marcar ou desmarcar, dar ou tirar nota, remover da lista, apagar buscas, ligar ou desligar o histórico, baixar e excluir: tudo no servidor (Server Actions ou rotas), sempre conferindo a sessão.
- Os botões respondem na hora (atualização otimista) e voltam ao estado anterior com um aviso se o servidor falhar.

### Falhas
- Banco fora do ar: o catálogo funciona normalmente. Os botões pessoais não aparecem, ou mostram "Não foi possível carregar sua lista agora". A Minha conta mostra uma mensagem amigável.
- TMDB fora do ar na Minha conta: a lista aparece só com o que foi possível carregar. O filme que falhou aparece como "Filme #id", com o botão de remover.

## 8. Ordem sugerida das etapas (cada uma visível no navegador)

1. Ativar a Neon pela Vercel e criar as tabelas.
2. Login com Google: "Entrar" e "Sair" no topo.
3. "Quero assistir" na página do filme e a aba da Minha conta.
4. "Já assisti" + 👍/👎 e a marquinha "✓ visto" nos cartões.
5. Vistos recentemente.
6. Buscas recentes na caixa de busca.
7. Privacidade e dados: página `/privacidade`, chave do histórico, baixar dados, excluir conta.
8. Revisão final: medir o Lighthouse de novo e fazer a checagem de segurança.

## 9. Testes esperados

- **Unitários (Vitest):**
  - validação do id e da nota;
  - regras das listas (marcar "Já assisti" remove de "Quero assistir"; limites; repetido sobe para o topo);
  - limpeza e deduplicação das buscas;
  - montagem do arquivo "baixar meus dados".
- **Ponta a ponta (Playwright, com a pessoa de teste):**
  - entrar e sair;
  - marcar "Quero assistir" e ver na Minha conta;
  - "Já assisti" tira da outra lista e mostra "✓ visto" no catálogo;
  - abrir um filme aparece em Vistos recentemente;
  - buscar aparece nas buscas recentes;
  - desligar o histórico apaga e para de guardar;
  - excluir a conta apaga tudo;
  - quem não está logado é mandado para a entrada ao tentar usar os botões;
  - uma pessoa não acessa dados de outra;
  - sem violações sérias de acessibilidade nas páginas novas.

## 10. Decisões tomadas pelo Claude (o dono pode revisar)

- Banco: Neon pela integração da Vercel, com ramo separado para as prévias. Login: Better Auth.
- Depois de entrar, a pessoa volta ao filme, mas a ação não é refeita sozinha.
- Botões de lista só na página do filme. Os cartões têm só a marquinha "✓ visto".
- "Já assisti" tira o filme de "Quero assistir". Os filmes assistidos não somem do catálogo (aceito pelo dono).
- Limites: 20 vistos recentemente, 5 buscas, 500 em "Quero assistir" e 2.000 em "Já assisti".
- O histórico começa ligado. Ao desligar, o histórico antigo é apagado.
- O banco guarda só o id do filme. O resto vem do TMDB.
- Login nas prévias pelo proxy OAuth da Better Auth, se funcionar. Senão, o login é testado no localhost e no site oficial.
- Pessoa de teste para o robô, impossível de ativar em produção.

## 11. Respondido pelo dono

- **Contato da página de privacidade:** catalogostreamingof@gmail.com. O dono não informou um nome; a página fala em "o responsável pelo Catálogo Streaming" (decisão do Claude, pode ser trocado por um nome depois).

## 12. Fica a critério de quem constrói

- Nomes de arquivos, funções e tabelas, seguindo os padrões das fases anteriores (lógica pura em `src/lib` com testes; telas em `src/components` e `src/app`).
- Usar ou não um ORM (como o Drizzle) e como criar as tabelas (migrações).
- O visual exato dos botões, do menu da conta e da Minha conta, dentro do tema atual do site.
- Se cada parte pessoal carrega por `<Suspense>` no servidor ou por pedido do navegador, desde que respeite o anti-objetivo de desempenho.
