# Catálogo Streaming: novo visual "Parede de pôsteres viva" (design curto)

**Data:** 2026-11-24 · **Status:** aprovado pelo dono em 2026-11-24 (opção B; efeito de troca escolhido depois de 3 rodadas de desenhos: "Cascata + letreiro")

## Intenção
Deixar o site visualmente marcante e com movimento, sem mudar as funções. Projeto de estudo: o dono quer aprender a fazer um site bonito e dinâmico.

## Abordagens consideradas
- A) Sala de cinema (cortina, letreiro com lâmpadas, cartões-ingresso): charmoso, mas "fantasia" e a cortina cansa.
- **B) Parede de pôsteres viva + cor por streaming (escolhida pelo dono):** usa as capas reais; o movimento tem função (a cor responde à escolha).
- C) Locadora anos 90 (neon, VHS): único, mas atrapalha a leitura e envelhece rápido.

## Decidido
- **Página inicial:** um topo de largura total com três fileiras inclinadas de capas do serviço escolhido deslizando devagar (sentidos alternados) e o título "O que assistir / hoje à noite" (a 2ª linha só no contorno).
- **Cor por streaming** (CSS, sem JavaScript para pintar): Todos = âmbar de projetor; Netflix vermelho; Prime azul-claro; Disney+ azul; HBO Max roxo; Globoplay laranja. Cada tema define fundo, superfícies, destaque, texto sobre o destaque e destaque usado como texto, todos com contraste AA. A página do filme aberta a partir de um serviço herda a cor dele.
- **Troca de serviço ("Cascata + letreiro", escolhido pelo dono):**
  - as capas da parede **viram uma por uma** (giro em Y, uma depois da outra) e revelam as capas do novo serviço;
  - a 2ª linha do título vira **letra por letra**, como um painel de aeroporto, e mostra a frase do serviço: "hoje à noite" (Todos), "na Netflix", "no Prime Video", "no Disney+", "na HBO Max", "no Globoplay";
  - as cores mudam de forma gradual (cerca de 1 s).
  - Rejeitados nos desenhos: faixa de cor sólida (forte demais), faixa de luz translúcida, onda, dissolver, holofote e foco de câmera.
- **Fontes:** Big Shoulders (títulos, maiúsculas) e Instrument Sans (texto), via next/font.
- **Cartões:** ao passar o mouse ou focar, a capa sobe e inclina 1°, com brilho na cor do tema.
- **"✓ visto" otimizado:** cada cartão tem a marquinha escondida; um único componente na página libera as dos filmes assistidos.
- **Reduzir movimento:** parede parada, sem faixa, sem transições.

## Anti-objetivos
- Piorar acessibilidade (hoje 100) ou deixar texto ilegível em alguma paleta.
- Piorar o desempenho: as capas da parede são pequenas (w154), animadas só com `transform`, e o maior elemento da tela é o título (texto).
- Quebrar os testes existentes.

## Fica a critério de quem constrói
Tamanhos exatos, número de capas por fileira, velocidade da parede e ajustes de espaçamento.
