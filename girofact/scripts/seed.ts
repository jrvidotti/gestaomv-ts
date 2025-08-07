import {
  type ResultImportacao,
  executaImportacao,
  usersConfig,
} from "@/lib/import-export";

async function main() {
  const results: Record<string, ResultImportacao> = {};
  results.users = await executaImportacao(usersConfig);
  console.table(results, ["importados", "ignorados", "erros", "tempoMs"]);
}

main()
  .then(() => {
    console.log("Seed concluído");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
