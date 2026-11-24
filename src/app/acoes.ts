"use server";

// As "ações" que mudam dados da pessoa. Rodam sempre no servidor e sempre conferem
// o login: quem é a pessoa vem da sessão, nunca de um valor enviado pelo navegador.

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { apagarHistorico, definirHistorico, excluirConta, historicoLigado } from "@/lib/dados/conta";
import { apagarBusca, listarBuscas, registrarBusca, registrarVisita } from "@/lib/dados/historico";
import { darNota, marcarAssistido, marcarQuero, removerDe } from "@/lib/dados/listas";
import { normalizarBusca } from "@/lib/busca";
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

/** Guarda que a pessoa abriu o filme. Não faz nada sem login ou com o histórico desligado. */
export async function registrarVisitaAcao(filmeId: number): Promise<void> {
  const id = lerIdFilme(filmeId);
  const usuario = await obterUsuario();
  if (!id || !usuario) return;
  try {
    // Confere no banco (e não no resumo guardado no cookie, que pode ter até 5 minutos)
    if (!(await historicoLigado(usuario.id))) return;
    await registrarVisita(usuario.id, id);
  } catch (erro) {
    console.error("Falha ao registrar visita:", erro);
  }
}

/**
 * Guarda a busca e devolve a lista atualizada (para a caixa de busca mostrar na hora).
 * Não faz nada sem login, com o histórico desligado ou com texto inválido (devolve null).
 */
export async function registrarBuscaAcao(texto: string): Promise<string[] | null> {
  const limpo = normalizarBusca(texto);
  const usuario = await obterUsuario();
  if (!limpo || !usuario) return null;
  try {
    if (!(await historicoLigado(usuario.id))) return null;
    await registrarBusca(usuario.id, limpo);
    return await listarBuscas(usuario.id);
  } catch (erro) {
    console.error("Falha ao registrar busca:", erro);
    return null;
  }
}

/** Apaga uma busca recente (pelo texto) ou todas (null). Devolve a lista atualizada. */
export async function apagarBuscaAcao(texto: string | null): Promise<string[] | null> {
  if (texto !== null && typeof texto !== "string") return null;
  const usuario = await obterUsuario();
  if (!usuario) return null;
  try {
    await apagarBusca(usuario.id, texto);
    return await listarBuscas(usuario.id);
  } catch (erro) {
    console.error("Falha ao apagar busca:", erro);
    return null;
  }
}

/** Atualiza o resumo da sessão guardado no cookie (para a mudança valer já, não em 5 minutos). */
async function atualizarSessao() {
  await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
}

/** Chave "Guardar meu histórico". Ao desligar, apaga vistos recentemente e buscas recentes. */
export async function definirHistoricoAcao(ligado: boolean): Promise<Resultado> {
  if (typeof ligado !== "boolean") return { ok: false, motivo: "invalido" };
  const usuario = await obterUsuario();
  if (!usuario) return { ok: false, motivo: "sem-login" };
  try {
    await definirHistorico(usuario.id, ligado);
    await atualizarSessao();
    refresh();
    return { ok: true };
  } catch (erro) {
    console.error("Falha ao mudar o histórico:", erro);
    return { ok: false, motivo: "erro" };
  }
}

/** Botão "Apagar histórico": apaga vistos recentemente e buscas recentes. */
export async function apagarHistoricoAcao(): Promise<Resultado> {
  const usuario = await obterUsuario();
  if (!usuario) return { ok: false, motivo: "sem-login" };
  try {
    await apagarHistorico(usuario.id);
    refresh();
    return { ok: true };
  } catch (erro) {
    console.error("Falha ao apagar o histórico:", erro);
    return { ok: false, motivo: "erro" };
  }
}

/** "Excluir minha conta": encerra o login (apaga o cookie) e depois apaga a conta e tudo dela. */
export async function excluirContaAcao(): Promise<Resultado> {
  const usuario = await obterUsuario();
  if (!usuario) return { ok: false, motivo: "sem-login" };
  try {
    await auth.api.signOut({ headers: await headers() });
    await excluirConta(usuario.id);
    return { ok: true };
  } catch (erro) {
    console.error("Falha ao excluir a conta:", erro);
    return { ok: false, motivo: "erro" };
  }
}
