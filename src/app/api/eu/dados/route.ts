import { exportarDados } from "@/lib/dados/conta";
import { obterUsuario } from "@/lib/sessao";

/**
 * "Baixar meus dados" (LGPD): devolve um arquivo .json com tudo o que o site guarda sobre a pessoa.
 * Sem login: 401 (não autorizado).
 */
export async function GET() {
  const usuario = await obterUsuario();
  if (!usuario) return Response.json({ erro: "Entre na sua conta para baixar seus dados." }, { status: 401 });

  const dados = await exportarDados(usuario.id);
  if (!dados) return Response.json({ erro: "Conta não encontrada." }, { status: 404 });

  return new Response(JSON.stringify(dados, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="meus-dados-catalogo.json"',
      // Dados pessoais: nunca guardar em cache
      "Cache-Control": "private, no-store",
    },
  });
}
