import {
	type ResultImportacao,
	consultasCpfConfig,
	executaImportacao,
	seedFactoring,
	usersConfig,
} from "@/lib/seed";

async function main() {
	const results: Record<string, ResultImportacao> = {};
	results.users = await executaImportacao(usersConfig);
	results.consultasCpf = await executaImportacao(consultasCpfConfig);
	console.table(results, ["importados", "ignorados", "erros", "tempoMs"]);

	await seedFactoring();
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
