import { ApiDirectDataClient } from "./src";

if (!process.env.DIRECTD_TOKEN) {
	console.error("❌ DIRECTD_TOKEN não configurado");
	process.exit(1);
}

// Exemplo de uso do cliente de consulta de dados
async function consultaCPF(cpf: string) {
	// Configurar o cliente
	const client = new ApiDirectDataClient({
		token: process.env.DIRECTD_TOKEN!,
		debug: true, // Habilitar logs para debug
	});

	try {
		console.log("🔍 Iniciando consulta de pessoa física...");

		// Consulta básica de pessoa física
		const resultado = await client.consultarCadastroPessoaFisica({
			cpf: cpf, // Substitua por um CPF válido
		});

		console.log("✅ Consulta realizada com sucesso!");
		console.log("📊 Metadados:", resultado.metaDados);

		if (resultado.retorno) {
			console.log("👤 Dados da pessoa:");
			console.log(`  Nome: ${resultado.retorno.nome}`);
			console.log(`  CPF: ${resultado.retorno.cpf}`);
			console.log(`  Data de Nascimento: ${resultado.retorno.dataNascimento}`);
			console.log(`  Nome da Mãe: ${resultado.retorno.nomeMae}`);
			console.log(`  Sexo: ${resultado.retorno.sexo}`);
			console.log(`  Idade: ${resultado.retorno.idade}`);
			console.log(`  Signo: ${resultado.retorno.signo}`);
			console.log(`  Renda Estimada: ${resultado.retorno.rendaEstimada}`);
			console.log(`  Faixa Salarial: ${resultado.retorno.rendaFaixaSalarial}`);

			// Telefones
			if (
				resultado.retorno.telefones &&
				resultado.retorno.telefones.length > 0
			) {
				console.log("📞 Telefones:");
				resultado.retorno.telefones.forEach((telefone, index) => {
					console.log(
						`  ${
							index + 1
						}. ${telefone.telefoneComDDD} (${telefone.tipoTelefone})`,
					);
					console.log(`     Operadora: ${telefone.operadora}`);
					console.log(`     WhatsApp: ${telefone.whatsApp ? "Sim" : "Não"}`);
					console.log(
						`     Telemarketing Bloqueado: ${
							telefone.telemarketingBloqueado ? "Sim" : "Não"
						}`,
					);
				});
			}

			// Endereços
			if (
				resultado.retorno.enderecos &&
				resultado.retorno.enderecos.length > 0
			) {
				console.log("🏠 Endereços:");
				resultado.retorno.enderecos.forEach((endereco, index) => {
					console.log(
						`  ${index + 1}. ${endereco.logradouro}, ${endereco.numero}`,
					);
					console.log(
						`     ${endereco.bairro} - ${endereco.cidade}/${endereco.uf}`,
					);
					console.log(`     CEP: ${endereco.cep}`);
					if (endereco.complemento) {
						console.log(`     Complemento: ${endereco.complemento}`);
					}
				});
			}

			// E-mails
			if (resultado.retorno.emails && resultado.retorno.emails.length > 0) {
				console.log("📧 E-mails:");
				resultado.retorno.emails.forEach((email, index) => {
					console.log(`  ${index + 1}. ${email.enderecoEmail}`);
				});
			}
		}

		// Se foi gerado comprovante, mostrar URL
		if (resultado.metaDados?.urlComprovante) {
			console.log(
				`📄 Comprovante disponível em: ${resultado.metaDados.urlComprovante}`,
			);
		}
	} catch (error) {
		console.error(
			"❌ Erro na consulta:",
			error instanceof Error ? error.message : String(error),
		);
	}
}

// Executar exemplo
console.log("🚀 Executando exemplo de uso do @zaptickets/api-direct-data\n");

const cpf = process.argv[2];

if (!cpf) {
	console.error("❌ CPF não informado");
	process.exit(1);
}

consultaCPF(cpf)
	.then(() => {
		console.log("\n✅ Exemplo concluído");
	})
	.catch((error) => {
		console.error(
			"\n❌ Erro no exemplo:",
			error instanceof Error ? error.message : String(error),
		);
	});
