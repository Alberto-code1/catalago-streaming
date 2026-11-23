"use server";

// As "ações" que mudam dados da pessoa. Rodam sempre no servidor e sempre conferem
// o login: quem é a pessoa vem da sessão, nunca de um valor enviado pelo navegador.

import { refresh } from "next/cache";
import { darNota, marcarAssistido, marcarQuero, removerDe } from "@/lib/dados/listas";
import { lerAba, lerIdFilme, lerNota, type Nota } from "@/lib/listas";
import { obterUsuario } from "@/lib/sessao";

/** A resposta de toda ação: deu certo, ou o motivo de não ter dado. */
export type Resultado = { ok: true } | { ok: false; motivo: "sem-login" | "limite" | "invalido" | "erro" };

/** Roda a gravação com a pessoa logada e um id válido; transforma erros em respostas. */
async function comPessoaEFilme(
  filmeId: unknown,
  gravar: (usuarioId: string, id: number) => Promise<"ok" | "limite" | void>,
): Promise<Resultado> {
  const id = lerIdFilme(filmeId);
  if (!id) return { ok: false, motivo: "invalido" };
  const usuario = await obterUsuario();
  if (!usuario) return { ok: false, motivo: "sem-login" };
  try {
    const r = await gravar(usuario.id, id);
    return r === "limite" ? { ok: false, motivo: "limite" } : { ok: true };
  } catch (erro) {
    console.error("Falha ao gravar na lista:", erro);
    return { ok: false, motivo: "erro" };
  }
}

/** Põe (marcado = true) ou tira o filme de "Quero assistir". */
export async function alternarQuero(filmeId: number, marcado: boolean): Promise<Resultado> {
  return comPessoaEFilme(filmeId, (u, id) => marcarQuero(u, id, marcado === true));
}

/** Marca (true) ou desmarca o filme como assistido. Marcar também o tira de "Quero assistir". */
export async function alternarAssistido(filmeId: number, marcado: boolean): Promise<Resultado> {
  return comPessoaEFilme(filmeId, (u, id) => marcarAssistido(u, id, marcado === true));
}

/** Dá a nota 👍 ("gostei"), 👎 ("nao_gostei") ou tira a nota (null). */
export async function definirNota(filmeId: number, nota: Nota): Promise<Resultado> {
  const valor = lerNota(nota);
  if (valor === undefined) return { ok: false, motivo: "invalido" };
  return comPessoaEFilme(filmeId, (u, id) => darNota(u, id, valor));
}

/** Botão "Remover" da Minha conta: tira o filme da lista da aba e atualiza a página. */
export async function removerDaLista(lista: string, filmeId: number): Promise<Resultado> {
  const r = await comPessoaEFilme(filmeId, (u, id) => removerDe(u, lerAba(lista), id));
  if (r.ok) refresh();
  return r;
}
