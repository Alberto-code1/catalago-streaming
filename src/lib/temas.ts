// Os temas de cor do site: um para "Todos" e um para cada streaming.
// As cores ficam no globals.css; aqui ficam só o nome do tema e a frase do letreiro.

import { servicoPorSlug } from "./servicos";

export type Tema = "todos" | "netflix" | "prime" | "disney" | "max" | "globoplay";

const FRASES: Record<Tema, string> = {
  todos: "hoje à noite",
  netflix: "na Netflix",
  prime: "no Prime Video",
  disney: "no Disney+",
  max: "na HBO Max",
  globoplay: "no Globoplay",
};

/** O tema de um serviço (pelo apelido da URL). Sem serviço, ou com um desconhecido: "todos". */
export function temaDoServico(slug: string | undefined): Tema {
  const servico = servicoPorSlug(slug);
  return servico ? (servico.slug as Tema) : "todos";
}

/** A 2ª linha do título da página inicial: "O que assistir" + esta frase. */
export function fraseDoTema(tema: Tema): string {
  return FRASES[tema];
}
