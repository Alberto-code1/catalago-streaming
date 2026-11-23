// Pequenas funções que deixam os dados do TMDB prontos para aparecer na tela.

/** 8.234 → "8.2" */
export function formatarNota(nota: number): string {
  return nota.toFixed(1);
}

/** 166 → "2h 46min"; 45 → "45min"; 120 → "2h"; sem duração → null */
export function formatarDuracao(minutos: number | null): string | null {
  if (!minutos) return null;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto}min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h ${resto}min`;
}

/** "2024-02-27" → "2024" */
export function extrairAno(data: string | undefined): string {
  return data ? data.slice(0, 4) : "";
}

type TamanhoImagem = "w92" | "w185" | "w342" | "w780" | "w1280";

/** Monta o endereço da imagem no servidor de imagens do TMDB. */
export function urlImagem(caminho: string | null, tamanho: TamanhoImagem): string | null {
  return caminho ? `https://image.tmdb.org/t/p/${tamanho}${caminho}` : null;
}

/** "Timothée Chalamet" → "TC" (usado quando o ator não tem foto) */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/** Corta um texto longo no limite, sem partir palavras, e põe "…" no fim. */
export function resumir(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  return texto.slice(0, limite - 1).replace(/\s+\S*$/, "") + "…";
}
