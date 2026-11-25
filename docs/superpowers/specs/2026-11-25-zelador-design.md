# Zelador do Catálogo — design

Data: 2026-11-25 · Tamanho: mudança pequena

## Intenção

Primeiro "funcionário" de IA do dono, para aprender agentes na prática (primeiro degrau da ideia de um negócio operado por uma equipe de agentes). O Zelador faz uma ronda no **site publicado** como um visitante comum e **só relata** o que encontrou. O dono quer **ver o agente trabalhando ao vivo**: os passos no chat do VS Code e o Chrome se mexendo na tela.

O robô "Qualidade" já confere o código a cada push. O Zelador cobre o que ninguém vigia: o site no ar entre uma mudança e outra (TMDB fora, pôster sumido, banco ou login com falha).

## Objetivos

Ronda em https://catalogo-streaming-one.vercel.app, nesta ordem:

1. Página inicial abre; parede de pôsteres aparece sem imagens quebradas.
2. Filtro por serviço (ex.: Netflix) mostra filmes.
3. Filtro por gênero muda a lista.
4. Busca por um filme conhecido (ex.: "Matrix") traz resultado com selo de serviços.
5. Página de um filme mostra título, capa e onde assistir.
6. Botão "Entrar com Google" aparece (sem entrar).
7. /privacidade abre.
8. Console do navegador: erros escondidos.

Relatório final em português, uma linha por item com ✅ / ⚠️ / ❌, e resumo ("N problemas, N alertas. Nada foi alterado.").

## Fora do escopo (agora)

- Parte de quem está logado ("Quero assistir", Minha conta): precisaria da conta Google do dono. Fica para uma versão 2.
- Rodar sozinho em horário marcado e o "diário de bordo": degrau 3.

## Anti-objetivos (seria fracasso mesmo funcionando)

- Mudar código, fazer commit/push, mexer em GitHub, Vercel, TMDB ou Neon.
- Entrar na conta do dono, clicar em "excluir conta", "baixar dados" ou qualquer ação que altere dados.
- Disparar alertas/confirmações do navegador (travam o Chrome).
- Dizer que conferiu algo que não conferiu.

## Abordagens consideradas

- **A) Subagente do Claude Code** — manual em português em `.claude/agents/zelador.md`, só com ferramentas do Chrome. **Escolhida pelo dono:** não exige programar, mostra os passos no chat e o Chrome na tela, e é um agente de verdade (decide o que investigar). O manual é reaproveitável depois.
- B) Roteiro fixo Playwright — não é agente, não se adapta, repete o robô "Qualidade". Descartada.
- C) Programa com Claude Agent SDK — exige código e chave paga da API; fica para os degraus 3–4.

## Decisões do Claude (o dono pode corrigir)

- Ferramentas do Zelador: só as do Claude in Chrome (abrir aba, navegar, ler página, clicar, console, GIF). Nenhuma ferramenta de arquivos ou terminal.
- Ele trabalha numa **aba nova** do Chrome e fecha ao final.
- Grava um **GIF** da ronda para o dono rever depois.
- Se um passo falhar, ele investiga um pouco (ex.: recarrega uma vez) antes de marcar ❌, e anota o que viu.
- O manual fica em português simples, para o dono conseguir ler e editar.

## Deixado para quem constrói

Texto exato do manual, nome do arquivo do GIF, qual gênero/filme usar como exemplo.
