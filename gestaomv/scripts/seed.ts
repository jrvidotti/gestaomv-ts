import {
	type ResultImportacao,
	cargosConfig,
	consultasCpfConfig,
	departamentosConfig,
	empresasConfig,
	equipesConfig,
	executaImportacao,
	materiaisConfig,
	solicitacoesConfig,
	tiposMaterialConfig,
	unidadesConfig,
	unidadesMedidaConfig,
	usersConfig,
} from "@/lib/import-export";

async function main() {
	const results: Record<string, ResultImportacao> = {};
	results.users = await executaImportacao(usersConfig);
	results.tiposMaterial = await executaImportacao(tiposMaterialConfig);
	results.unidadesMedida = await executaImportacao(unidadesMedidaConfig);
	results.consultasCpf = await executaImportacao(consultasCpfConfig);
	results.empresas = await executaImportacao(empresasConfig);
	results.unidades = await executaImportacao(unidadesConfig);
	results.departamentos = await executaImportacao(departamentosConfig);
	results.equipes = await executaImportacao(equipesConfig);
	results.cargos = await executaImportacao(cargosConfig);
	results.materiais = await executaImportacao(materiaisConfig);
	results.solicitacoes = await executaImportacao(solicitacoesConfig);
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
