import {
	type ResultExportacao,
	type ResultImportacao,
	cargosConfig,
	consultasCpfConfig,
	departamentosConfig,
	empresasConfig,
	equipesConfig,
	executaExportacao,
	materiaisConfig,
	solicitacoesConfig,
	tiposMaterialConfig,
	unidadesConfig,
	unidadesMedidaConfig,
	usersConfig,
} from "@/lib/import-export";

async function main() {
	const results: Record<string, ResultExportacao> = {};
	// results.users = await executaExportacao(usersConfig);
	// results.tiposMaterial = await executaExportacao(tiposMaterialConfig);
	// results.unidadesMedida = await executaExportacao(unidadesMedidaConfig);
	// results.consultasCpf = await executaExportacao(consultasCpfConfig);
	// results.empresas = await executaExportacao(empresasConfig);
	// results.unidades = await executaExportacao(unidadesConfig);
	// results.departamentos = await executaExportacao(departamentosConfig);
	// results.equipes = await executaExportacao(equipesConfig);
	// results.cargos = await executaExportacao(cargosConfig);
	// results.materiais = await executaExportacao(materiaisConfig);
	results.solicitacoes = await executaExportacao(solicitacoesConfig);
	console.table(results, ["exportados", "tempoMs"]);
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
