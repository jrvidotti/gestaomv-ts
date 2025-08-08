import { db } from "@/db";
import {
	carteiras,
	clientes,
	contatosReferencia,
	dadosBancarios,
	pessoas,
	telefones,
} from "../schemas";

export async function seedFactoring() {
	console.log("🌱 Iniciando seed do módulo Factoring...");

	try {
		// 1. Criar carteiras de exemplo
		console.log("📊 Criando carteiras...");
		const [carteiraExemplo] = await db
			.insert(carteiras)
			.values({
				nome: "Carteira Principal",
				banco: "001",
				agencia: "1234-5",
				conta: "12345-6",
				chavePix: "carteira@factoring.com.br",
				userId: 1, // Assumindo que existe um usuário admin com ID 1
			})
			.returning();

		// 2. Criar pessoas físicas de exemplo
		console.log("👥 Criando pessoas físicas...");
		const pessoasFisicas = await db
			.insert(pessoas)
			.values([
				{
					tipoPessoa: "fisica",
					documento: "12345678901",
					nomeRazaoSocial: "João Silva Santos",
					dataNascimentoFundacao: "1985-06-15",
					nomeMae: "Maria Silva",
					sexo: "masculino",
					email: "joao.silva@email.com",
					cep: "01234567",
					logradouro: "Rua das Flores",
					numero: "123",
					bairro: "Centro",
					cidade: "São Paulo",
					estado: "SP",
				},
				{
					tipoPessoa: "fisica",
					documento: "98765432100",
					nomeRazaoSocial: "Maria Oliveira Costa",
					dataNascimentoFundacao: "1990-03-22",
					nomeMae: "Ana Oliveira",
					sexo: "feminino",
					email: "maria.costa@email.com",
					cep: "09876543",
					logradouro: "Avenida Principal",
					numero: "456",
					bairro: "Jardins",
					cidade: "São Paulo",
					estado: "SP",
				},
			])
			.returning();

		// 3. Criar pessoas jurídicas de exemplo
		console.log("🏢 Criando pessoas jurídicas...");
		const pessoasJuridicas = await db
			.insert(pessoas)
			.values([
				{
					tipoPessoa: "juridica",
					documento: "12345678000195",
					nomeRazaoSocial: "Empresa ABC Ltda",
					nomeFantasia: "ABC Comercial",
					dataNascimentoFundacao: "2010-01-15",
					inscricaoEstadual: "123456789",
					email: "contato@abccomercial.com.br",
					cep: "12345678",
					logradouro: "Rua Comercial",
					numero: "789",
					bairro: "Industrial",
					cidade: "São Paulo",
					estado: "SP",
				},
				{
					tipoPessoa: "juridica",
					documento: "98765432000176",
					nomeRazaoSocial: "XYZ Indústria e Comércio S.A.",
					nomeFantasia: "XYZ Group",
					dataNascimentoFundacao: "2005-08-30",
					inscricaoEstadual: "987654321",
					email: "financeiro@xyzgroup.com.br",
					cep: "87654321",
					logradouro: "Avenida Industrial",
					numero: "1000",
					bairro: "Distrito Industrial",
					cidade: "Guarulhos",
					estado: "SP",
				},
			])
			.returning();

		const todasPessoas = [...pessoasFisicas, ...pessoasJuridicas];

		// 4. Criar telefones para as pessoas
		console.log("📞 Criando telefones...");
		const telefonesSeed = [];
		for (let i = 0; i < todasPessoas.length; i++) {
			telefonesSeed.push({
				pessoaId: todasPessoas[i].id,
				numero: `1199${(1000000 + i).toString().padStart(7, "0")}`,
				principal: true,
				whatsapp: true,
			});
			// Segundo telefone para algumas pessoas
			if (i % 2 === 0) {
				telefonesSeed.push({
					pessoaId: todasPessoas[i].id,
					numero: `1188${(2000000 + i).toString().padStart(7, "0")}`,
					principal: false,
					whatsapp: false,
				});
			}
		}
		await db.insert(telefones).values(telefonesSeed);

		// 5. Criar dados bancários
		console.log("🏦 Criando dados bancários...");
		const dadosBancariosSeed = [];
		for (let i = 0; i < todasPessoas.length; i++) {
			dadosBancariosSeed.push({
				pessoaId: todasPessoas[i].id,
				banco: i % 2 === 0 ? "001" : "237", // Banco do Brasil ou Bradesco
				agencia: `${1000 + i}`,
				conta: `${10000 + i * 10}`,
				digitoVerificador: ((i % 9) + 1).toString(),
				tipoConta: i % 3 === 0 ? "poupanca" : "corrente",
			});
		}
		await db.insert(dadosBancarios).values(dadosBancariosSeed);

		// 6. Criar clientes
		console.log("💼 Criando clientes...");
		const clientesSeed = [];
		for (let i = 0; i < todasPessoas.length; i++) {
			const pessoa = todasPessoas[i];
			const isEmpresa = pessoa.tipoPessoa === "juridica";

			clientesSeed.push({
				pessoaId: pessoa.id,
				status: i % 4 === 3 ? "inativo" : "ativo",
				creditoAutorizado: i % 3 !== 2, // 2/3 dos clientes com crédito autorizado
				limiteCredito: isEmpresa ? 50000 + i * 10000 : 5000 + i * 1000,
				taxaJurosPadrao: 2.5 + i * 0.1,
				tarifaDevolucaoCheques: 50,
				tarifaProrrogacao: 25,
				dataUltimaAnaliseCredito: new Date().toISOString().split('T')[0],
				usuarioResponsavelAnalise: 1,
				historicoAlteracoesLimite: [
					{
						data: new Date().toISOString().split('T')[0],
						limiteAnterior: 0,
						novoLimite: isEmpresa ? 50000 + i * 10000 : 5000 + i * 1000,
						usuario: "1",
						motivo: "Cadastro inicial via seed",
					},
				],
			});
		}
		const clientesCriados = await db
			.insert(clientes)
			.values(clientesSeed)
			.returning();

		// 7. Criar contatos de referência
		console.log("📋 Criando contatos de referência...");
		const contatosReferenciaSeed = [];
		for (let i = 0; i < clientesCriados.length; i++) {
			const cliente = clientesCriados[i];

			// Referência comercial
			contatosReferenciaSeed.push({
				clienteId: cliente.id,
				tipoReferencia: "referencia_comercial",
				nomeCompleto: `Fornecedor ${i + 1} Ltda`,
				telefone: `1133${(4000000 + i).toString().padStart(7, "0")}`,
				email: `fornecedor${i + 1}@email.com`,
				documento: `${(12000000000000 + i * 1000).toString().padStart(14, "0")}`,
				empresaOrganizacao: `Empresa Referência ${i + 1}`,
			});

			// Referência pessoal
			if (i % 2 === 0) {
				contatosReferenciaSeed.push({
					clienteId: cliente.id,
					tipoReferencia: "referencia_pessoal",
					nomeCompleto: `Referência Pessoal ${i + 1}`,
					telefone: `1144${(5000000 + i).toString().padStart(7, "0")}`,
					email: `referencia${i + 1}@email.com`,
				});
			}
		}
		await db.insert(contatosReferencia).values(contatosReferenciaSeed);

		console.log("✅ Seed do módulo Factoring concluído com sucesso!");
		console.log(`- ${todasPessoas.length} pessoas criadas`);
		console.log(`- ${clientesCriados.length} clientes criados`);
		console.log(
			`- ${contatosReferenciaSeed.length} contatos de referência criados`,
		);
		console.log("- 1 carteira criada");
	} catch (error) {
		console.error("❌ Erro no seed do módulo Factoring:", error);
		throw error;
	}
}
