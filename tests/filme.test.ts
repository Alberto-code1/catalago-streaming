import { describe, expect, test } from "vitest";
import { escolherTrailer, extrairOndeAssistir } from "@/lib/filme";

const video = (key: string, lang: string, type = "Trailer", site = "YouTube", official = false) => ({
  key,
  iso_639_1: lang,
  type,
  site,
  official,
});

describe("escolherTrailer", () => {
  test("prefere o trailer em português", () => {
    expect(escolherTrailer([video("en1", "en"), video("pt1", "pt")])).toBe("pt1");
  });

  test("usa o trailer em inglês quando não há em português", () => {
    expect(escolherTrailer([video("en1", "en"), video("t1", "pt", "Teaser")])).toBe("en1");
  });

  test("no mesmo idioma, prefere o trailer oficial", () => {
    expect(escolherTrailer([video("fa", "pt"), video("of", "pt", "Trailer", "YouTube", true)])).toBe("of");
  });

  test("ignora vídeos fora do YouTube e devolve null quando não sobra nenhum", () => {
    expect(escolherTrailer([video("vim", "pt", "Trailer", "Vimeo")])).toBeNull();
    expect(escolherTrailer([])).toBeNull();
  });
});

describe("extrairOndeAssistir", () => {
  const prov = (id: number, nome: string) => ({ provider_id: id, provider_name: nome, logo_path: "/l.png" });

  test("junta assinatura, grátis e com anúncios, sem repetir", () => {
    const resultado = extrairOndeAssistir({ flatrate: [prov(1899, "HBO Max")], ads: [prov(1, "Pluto")], free: [prov(1899, "HBO Max")] });
    expect(resultado.map((p) => p.nome)).toEqual(["HBO Max", "Pluto"]);
  });

  test("monta o endereço do logo", () => {
    expect(extrairOndeAssistir({ flatrate: [prov(8, "Netflix")] })[0].logo).toBe("https://image.tmdb.org/t/p/w92/l.png");
  });

  test("devolve lista vazia quando o filme não está em streaming no Brasil", () => {
    expect(extrairOndeAssistir(undefined)).toEqual([]);
  });
});
