import { describe, expect, test } from "vitest";
import { extrairAno, formatarDuracao, formatarNota, iniciais, resumir, urlImagem } from "@/lib/formatar";

describe("formatarNota", () => {
  test("mostra uma casa decimal com ponto", () => {
    expect(formatarNota(8.234)).toBe("9.9"); // ERRO DE PROPÓSITO: aula do robô
    expect(formatarNota(0)).toBe("0.0");
  });
});

describe("formatarDuracao", () => {
  test("converte minutos em horas e minutos", () => {
    expect(formatarDuracao(166)).toBe("2h 46min");
    expect(formatarDuracao(45)).toBe("45min");
    expect(formatarDuracao(120)).toBe("2h");
  });

  test("devolve null quando não há duração", () => {
    expect(formatarDuracao(null)).toBeNull();
    expect(formatarDuracao(0)).toBeNull();
  });
});

describe("extrairAno", () => {
  test("pega o ano de uma data do TMDB", () => {
    expect(extrairAno("2024-02-27")).toBe("2024");
  });

  test("devolve texto vazio quando não há data", () => {
    expect(extrairAno("")).toBe("");
    expect(extrairAno(undefined)).toBe("");
  });
});

describe("urlImagem", () => {
  test("monta o endereço completo da imagem no TMDB", () => {
    expect(urlImagem("/abc.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/abc.jpg");
  });

  test("devolve null quando o filme não tem imagem", () => {
    expect(urlImagem(null, "w342")).toBeNull();
  });
});

describe("iniciais", () => {
  test("usa a primeira letra do primeiro e do último nome", () => {
    expect(iniciais("Timothée Chalamet")).toBe("TC");
    expect(iniciais("Ana Maria Braga")).toBe("AB");
  });

  test("usa uma letra quando há um nome só", () => {
    expect(iniciais("Zendaya")).toBe("Z");
  });
});

describe("resumir", () => {
  test("não mexe em texto curto", () => {
    expect(resumir("Um filme curto.", 160)).toBe("Um filme curto.");
  });

  test("corta texto longo sem partir palavras e põe reticências", () => {
    expect(resumir("Paul Atreides se une aos Fremen", 20)).toBe("Paul Atreides se…");
  });

  test("o resultado nunca passa do limite", () => {
    expect(resumir("a".repeat(300), 160).length).toBeLessThanOrEqual(160);
  });
});
