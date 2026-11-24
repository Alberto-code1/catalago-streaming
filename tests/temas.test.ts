import { describe, expect, it } from "vitest";
import { fraseDoTema, temaDoServico } from "@/lib/temas";

describe("temaDoServico", () => {
  it("usa o apelido do serviço como tema", () => {
    expect(temaDoServico("netflix")).toBe("netflix");
    expect(temaDoServico("globoplay")).toBe("globoplay");
  });

  it("sem serviço ou com um desconhecido, o tema é 'todos'", () => {
    expect(temaDoServico(undefined)).toBe("todos");
    expect(temaDoServico("xpto")).toBe("todos");
  });
});

describe("fraseDoTema", () => {
  it("tem a frase do letreiro de cada tema", () => {
    expect(fraseDoTema("todos")).toBe("hoje à noite");
    expect(fraseDoTema("netflix")).toBe("na Netflix");
    expect(fraseDoTema("prime")).toBe("no Prime Video");
    expect(fraseDoTema("disney")).toBe("no Disney+");
    expect(fraseDoTema("max")).toBe("na HBO Max");
    expect(fraseDoTema("globoplay")).toBe("no Globoplay");
  });
});
