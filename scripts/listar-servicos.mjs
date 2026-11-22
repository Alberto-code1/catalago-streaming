// Mostra os códigos (IDs) que o TMDB usa para cada serviço de streaming no Brasil.
// Como rodar: node --env-file=.env.local scripts/listar-servicos.mjs

const token = process.env.TMDB_READ_TOKEN;
if (!token) {
  console.error("Faltou o TMDB_READ_TOKEN no .env.local");
  process.exit(1);
}

const resposta = await fetch(
  "https://api.themoviedb.org/3/watch/providers/movie?watch_region=BR&language=pt-BR",
  { headers: { Authorization: `Bearer ${token}` } },
);
if (!resposta.ok) {
  console.error(`O TMDB respondeu com erro ${resposta.status}`);
  process.exit(1);
}

const { results } = await resposta.json();
const procurados = /netflix|prime|disney|max|globoplay/i;

for (const s of results.filter((s) => procurados.test(s.provider_name))) {
  console.log(`${s.provider_id}\t${s.provider_name}\t(prioridade BR: ${s.display_priorities?.BR ?? "-"})`);
}
