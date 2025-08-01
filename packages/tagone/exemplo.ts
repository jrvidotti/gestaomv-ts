import { PontoWebClient } from './src'

if (!process.env.PONTOWEB_USER || !process.env.PONTOWEB_PASS) {
	throw new Error('PONTOWEB_USER e PONTOWEB_PASS devem ser definidos')
}

async function exemplo() {
	try {
		console.log('🚀 Testando o cliente PontoWeb...')

		const client = await PontoWebClient.init(
			process.env.PONTOWEB_USER!,
			process.env.PONTOWEB_PASS!,
		)

		console.log('✅ Cliente inicializado com sucesso!')

		const funcionarios = await client.listaFuncionarios()
		console.log(`📋 Encontrados ${funcionarios.length} funcionários`)

		// imprimir tres ultimos funcionarios
		console.log('👥 Últimos 3 funcionários:', funcionarios.slice(-3))

		// const afastamentos = await client.listaAfastamentos(30)
		// console.log(
		// 	`🏥 Encontrados ${afastamentos.length} afastamentos nos últimos 30 dias`,
		// )
	} catch (error) {
		console.error('❌ Erro:', (error as Error).message)
	}
}

await exemplo()

process.exit(0)
