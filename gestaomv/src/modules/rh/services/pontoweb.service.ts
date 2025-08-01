import { env } from "@/env";
import type { ResultadoImportacao } from "@/modules/core/dtos";
import type { EmpresasService } from "@/modules/core/services/empresas.service";
import type { UnidadesService } from "@/modules/core/services/unidades.service";
import type { CargosService } from "@/modules/rh/services/cargos.service";
import type { DepartamentosService } from "@/modules/rh/services/departamentos.service";
import type { FuncionariosService } from "@/modules/rh/services/funcionarios.service";
import { type Funcionario, PontoWebClient } from "@movelabs/pontoweb";

export class PontowebService {
	constructor(
		private readonly funcionariosService: FuncionariosService,
		private readonly departamentosService: DepartamentosService,
		private readonly cargosService: CargosService,
		private readonly empresasService: EmpresasService,
		private readonly unidadesService: UnidadesService,
	) {}

	private async getPontowebClient() {
		if (!env.PONTOWEB_USER || !env.PONTOWEB_PASS) {
			throw new Error(
				"Variáveis de ambiente PONTOWEB_USER e PONTOWEB_PASS devem estar configuradas",
			);
		}
		const client = await PontoWebClient.init(
			env.PONTOWEB_USER,
			env.PONTOWEB_PASS,
		);
		return client;
	}

	private validarFuncionario(funcionario: Funcionario): {
		valido: boolean;
		erro?: string;
	} {
		if (!funcionario.Nome || funcionario.Nome.trim() === "") {
			return { valido: false, erro: "Nome é obrigatório" };
		}

		if (!funcionario.Cpf || funcionario.Cpf.trim() === "") {
			return { valido: false, erro: "CPF é obrigatório" };
		}

		if (!funcionario.Admissao) {
			return { valido: false, erro: "Data de admissão é obrigatória" };
		}

		return { valido: true };
	}

	private async importarEmpresa(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		empresaPontoWeb: any,
	): Promise<{ id: number; acao: "criada" | "atualizada" }> {
		// Verificar se empresa já existe por pontowebId
		const empresaExistente = await this.empresasService.findByPontowebId(
			empresaPontoWeb.Id,
		);

		const dadosEmpresa = {
			razaoSocial: empresaPontoWeb.Nome,
			nomeFantasia: empresaPontoWeb.Nome,
			cnpj:
				empresaPontoWeb.Documento || `${empresaPontoWeb.Id}.000.000/0001-00`,
			pontowebId: empresaPontoWeb.Id,
		};

		if (empresaExistente) {
			// Atualizar empresa existente
			const empresaAtualizada = await this.empresasService.update(
				empresaExistente.id,
				dadosEmpresa,
			);
			return { id: empresaAtualizada?.id || 0, acao: "atualizada" };
		}
		// Criar nova empresa
		const novaEmpresa = await this.empresasService.create(dadosEmpresa);
		return { id: novaEmpresa.id, acao: "criada" };
	}

	private async importarUnidade(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		estruturaPontoWeb: any,
	): Promise<{ id: number; acao: "criada" | "atualizada" }> {
		// Verificar se unidade já existe por pontowebId
		const unidadeExistente = await this.unidadesService.findByPontowebId(
			estruturaPontoWeb.Id,
		);

		const dadosUnidade = {
			codigo: estruturaPontoWeb.Id,
			nome: estruturaPontoWeb.Descricao,
			pontowebId: estruturaPontoWeb.Id,
		};

		if (unidadeExistente) {
			// Atualizar unidade existente
			const unidadeAtualizada = await this.unidadesService.update(
				unidadeExistente.id,
				dadosUnidade,
			);
			return { id: unidadeAtualizada?.id || 0, acao: "atualizada" };
		}
		// Criar nova unidade
		const novaUnidade = await this.unidadesService.create(dadosUnidade);
		return { id: novaUnidade.id, acao: "criada" };
	}

	private async importarDepartamento(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		departamentoPontoWeb: any,
	): Promise<{ id: number; acao: "criado" | "atualizado" }> {
		// Verificar se departamento já existe por pontowebId
		const departamentoExistente =
			await this.departamentosService.buscarDepartamentoPorPontowebId(
				departamentoPontoWeb.Id,
			);

		const dadosDepartamento = {
			nome: departamentoPontoWeb.Descricao,
			descricao: departamentoPontoWeb.Descricao,
			pontowebId: departamentoPontoWeb.Id,
		};

		if (departamentoExistente) {
			// Atualizar departamento existente
			const departamentoAtualizado =
				await this.departamentosService.atualizarDepartamento(
					departamentoExistente.id,
					dadosDepartamento,
				);
			return { id: departamentoAtualizado?.id || 0, acao: "atualizado" };
		}
		// Criar novo departamento
		const novoDepartamento =
			await this.departamentosService.criarDepartamento(dadosDepartamento);
		return { id: novoDepartamento.id, acao: "criado" };
	}

	private async importarCargo(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		funcaoPontoWeb: any,
		departamentoId: number,
	): Promise<{ id: number; acao: "criado" | "atualizado" }> {
		// Verificar se cargo já existe por pontowebId
		const cargoExistente = await this.cargosService.buscarCargoPorPontowebId(
			funcaoPontoWeb.Id,
		);

		const dadosCargo = {
			nome: funcaoPontoWeb.Descricao,
			descricao: funcaoPontoWeb.Descricao,
			departamentoId: departamentoId,
			pontowebId: funcaoPontoWeb.Id,
		};

		if (cargoExistente) {
			// Atualizar cargo existente
			const cargoAtualizado = await this.cargosService.atualizarCargo(
				cargoExistente.id,
				dadosCargo,
			);
			return { id: cargoAtualizado?.id || 0, acao: "atualizado" };
		}
		// Criar novo cargo
		const novoCargo = await this.cargosService.criarCargo(dadosCargo);
		return { id: novoCargo.id, acao: "criado" };
	}

	private async importarFuncionario(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		funcionario: any,
		empresasMap: Map<number, number>,
		unidadesMap: Map<number, number>,
		departamentosMap: Map<number, number>,
		cargosMap: Map<number, number>,
		modoAtualizar = false,
	): Promise<"importado" | "atualizado" | "ignorado" | "erro"> {
		try {
			// Verificar se o funcionário já existe
			const funcionarioExistente =
				await this.funcionariosService.buscarFuncionarioPorPontowebId(
					funcionario.Id,
				);

			// Mapear IDs das estruturas do PontoWeb para IDs do banco local
			const empresaId = funcionario.EmpresaId
				? empresasMap.get(funcionario.EmpresaId)
				: null;
			const unidadeId = funcionario.EstruturaId
				? unidadesMap.get(funcionario.EstruturaId)
				: null;
			const departamentoId = funcionario.DepartamentoId
				? departamentosMap.get(funcionario.DepartamentoId)
				: null;
			const cargoId = funcionario.FuncaoId
				? cargosMap.get(funcionario.FuncaoId)
				: null;

			const dadosFuncionario = {
				nome: funcionario.Nome,
				cpf: funcionario.Cpf,
				dataNascimento: funcionario.Nascimento
					? funcionario.Nascimento.toISOString()
					: undefined,
				sexo: undefined as "M" | "F" | "Outro" | undefined,
				nomeMae: undefined,
				email: funcionario.Email || undefined,
				telefone:
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					funcionario.Telefone || (funcionario as any).Celular || undefined,
				foto: undefined,
				cargoId: cargoId || 1, // Valor padrão temporário se não encontrar
				departamentoId: departamentoId || 1, // Valor padrão temporário se não encontrar
				unidadeId: unidadeId || undefined,
				empresaId: empresaId || undefined,
				dataAdmissao: funcionario.Admissao?.toISOString() || undefined,
				dataAvisoPrevio: undefined,
				dataDesligamento: funcionario.Demissao?.toISOString() || undefined,
				status: funcionario.Demissao
					? ("DESLIGADO" as const)
					: ("ATIVO" as const),
				pontowebId: funcionario.Id,
			};

			if (funcionarioExistente) {
				if (modoAtualizar) {
					// Atualizar funcionário existente
					await this.funcionariosService.atualizarFuncionario(
						funcionarioExistente.id,
						dadosFuncionario,
					);
					return "atualizado";
				}
				// Modo padrão: ignorar existentes
				return "ignorado";
			}
			// Criar novo funcionário
			await this.funcionariosService.criarFuncionario(dadosFuncionario);
			return "importado";
		} catch (error) {
			console.error(
				`Erro ao processar funcionário ${funcionario.Nome} (CPF: ${funcionario.Cpf}): ${(error as Error).message}`,
			);
			return "erro";
		}
	}

	async importarFuncionariosPontoWeb(
		modoAtualizar = false,
	): Promise<ResultadoImportacao> {
		const resultado: ResultadoImportacao = {
			empresas: { importadas: 0, atualizadas: 0, erros: [] },
			unidades: { importadas: 0, atualizadas: 0, erros: [] },
			departamentos: { importadas: 0, atualizadas: 0, erros: [] },
			cargos: { importados: 0, atualizados: 0, erros: [] },
			funcionarios: { importados: 0, atualizados: 0, ignorados: 0, erros: [] },
		};

		try {
			console.log("🚀 Iniciando importação de funcionários do PontoWeb...");

			// Inicializar cliente do PontoWeb
			console.log("🔐 Autenticando no PontoWeb...");
			const client = await this.getPontowebClient();

			// Buscar funcionários do PontoWeb
			console.log("📋 Buscando funcionários do PontoWeb...");
			const funcionarios = await client.listaFuncionarios();
			console.log(
				`📊 Encontrados ${funcionarios.length} funcionários no PontoWeb`,
			);

			// Extrair estruturas únicas do PontoWeb
			console.log("🏗️ Extraindo estruturas únicas...");
			const empresasUnicas = new Map();
			const unidadesUnicas = new Map();
			const departamentosUnicos = new Map();
			const cargosUnicos = new Map();

			for (const funcionario of funcionarios) {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const func = funcionario as any;

				if (func.Empresa && !empresasUnicas.has(func.Empresa.Id)) {
					empresasUnicas.set(func.Empresa.Id, func.Empresa);
				}

				if (func.Estrutura && !unidadesUnicas.has(func.Estrutura.Id)) {
					unidadesUnicas.set(func.Estrutura.Id, func.Estrutura);
				}

				if (
					func.Departamento &&
					!departamentosUnicos.has(func.Departamento.Id)
				) {
					departamentosUnicos.set(func.Departamento.Id, func.Departamento);
				}

				if (func.Funcao && !cargosUnicos.has(func.Funcao.Id)) {
					cargosUnicos.set(func.Funcao.Id, func.Funcao);
				}
			}

			// Importar empresas
			console.log("🏢 Importando empresas...");
			const empresasMap = new Map<number, number>();
			for (const [id, empresa] of empresasUnicas) {
				try {
					const { id: empresaId, acao } = await this.importarEmpresa(empresa);
					empresasMap.set(Number(id), empresaId);
					if (acao === "criada") {
						resultado.empresas.importadas++;
					} else {
						resultado.empresas.atualizadas++;
					}
				} catch (error) {
					const mensagemErro = `Erro ao importar empresa ${empresa.Nome}: ${(error as Error).message}`;
					console.error("❌", mensagemErro);
					resultado.empresas.erros.push(mensagemErro);
				}
			}

			// Importar unidades
			console.log("🏗️ Importando unidades...");
			const unidadesMap = new Map<number, number>();
			for (const [id, unidade] of unidadesUnicas) {
				try {
					const { id: unidadeId, acao } = await this.importarUnidade(unidade);
					unidadesMap.set(Number(id), unidadeId);
					if (acao === "criada") {
						resultado.unidades.importadas++;
					} else {
						resultado.unidades.atualizadas++;
					}
				} catch (error) {
					const mensagemErro = `Erro ao importar unidade ${unidade.Descricao}: ${(error as Error).message}`;
					console.error("❌", mensagemErro);
					resultado.unidades.erros.push(mensagemErro);
				}
			}

			// Importar departamentos
			console.log("🏛️ Importando departamentos...");
			const departamentosMap = new Map<number, number>();
			for (const [id, departamento] of departamentosUnicos) {
				try {
					const { id: departamentoId, acao } =
						await this.importarDepartamento(departamento);
					departamentosMap.set(Number(id), departamentoId);
					if (acao === "criado") {
						resultado.departamentos.importadas++;
					} else {
						resultado.departamentos.atualizadas++;
					}
				} catch (error) {
					const mensagemErro = `Erro ao importar departamento ${departamento.Descricao}: ${(error as Error).message}`;
					console.error("❌", mensagemErro);
					resultado.departamentos.erros.push(mensagemErro);
				}
			}

			// Importar cargos
			console.log("💼 Importando cargos...");
			console.log(
				`📊 Encontrados ${cargosUnicos.size} cargos únicos para importar`,
			);

			const cargosMap = new Map<number, number>();

			// Criar departamento padrão se necessário
			let departamentoPadrao: { id: number } | null = null;

			for (const [id, cargo] of cargosUnicos) {
				try {
					console.log(`🔍 Processando cargo: ${cargo.Descricao} (ID: ${id})`);

					// Usar departamento mapeado (se houver)
					const func = cargo;
					let departamentoId = func.DepartamentoId
						? departamentosMap.get(func.DepartamentoId)
						: null;

					console.log(
						`   Departamento original: ${func.DepartamentoId}, Mapeado: ${departamentoId}`,
					);

					// Se não há departamento mapeado, usar/criar um departamento padrão
					if (!departamentoId) {
						if (!departamentoPadrao) {
							console.log(
								"🏛️ Criando departamento padrão para cargos sem departamento...",
							);
							try {
								departamentoPadrao =
									await this.departamentosService.criarDepartamento({
										nome: "Departamento Geral",
										descricao:
											"Departamento padrão para cargos importados do PontoWeb sem departamento específico",
									});
								console.log(
									`✅ Departamento padrão criado com ID: ${departamentoPadrao.id}`,
								);
							} catch (error) {
								// Se já existe, buscar por nome
								console.log("🔍 Buscando departamento padrão existente...");
								const departamentos =
									await this.departamentosService.listarDepartamentos({
										busca: "Departamento Geral",
										limite: 1,
										pagina: 1,
									});
								if (departamentos.departamentos.length > 0) {
									departamentoPadrao = {
										id: departamentos.departamentos[0].id,
									};
									console.log(
										`✅ Departamento padrão encontrado com ID: ${departamentoPadrao.id}`,
									);
								} else {
									throw error;
								}
							}
						}
						departamentoId = departamentoPadrao.id;
						console.log(`   Usando departamento padrão: ${departamentoId}`);
					}

					const { id: cargoId, acao } = await this.importarCargo(
						cargo,
						departamentoId,
					);
					cargosMap.set(Number(id), cargoId);

					if (acao === "criado") {
						resultado.cargos.importados++;
						console.log(`✅ Cargo criado: ${cargo.Descricao}`);
					} else {
						resultado.cargos.atualizados++;
						console.log(`🔄 Cargo atualizado: ${cargo.Descricao}`);
					}
				} catch (error) {
					const mensagemErro = `Erro ao importar cargo ${cargo.Descricao}: ${(error as Error).message}`;
					console.error("❌", mensagemErro);
					resultado.cargos.erros.push(mensagemErro);
				}
			}

			console.log(
				`✅ Estruturas processadas: ${resultado.empresas.importadas + resultado.empresas.atualizadas} empresas, ${resultado.unidades.importadas + resultado.unidades.atualizadas} unidades, ${resultado.departamentos.importadas + resultado.departamentos.atualizadas} departamentos, ${resultado.cargos.importados + resultado.cargos.atualizados} cargos`,
			);

			// Processar funcionários
			console.log("👥 Processando funcionários...");
			let funcionariosProcessados = 0;
			for (const funcionario of funcionarios) {
				funcionariosProcessados++;

				// Validar funcionário
				const validacao = this.validarFuncionario(funcionario);
				if (!validacao.valido) {
					const mensagemErro = `Funcionário ${funcionario.Nome || "sem nome"} (CPF: ${funcionario.Cpf || "sem CPF"}): ${validacao.erro}`;
					resultado.funcionarios.erros.push(mensagemErro);
					continue;
				}

				// Importar funcionário
				const resultadoFuncionario = await this.importarFuncionario(
					funcionario,
					empresasMap,
					unidadesMap,
					departamentosMap,
					cargosMap,
					modoAtualizar,
				);

				switch (resultadoFuncionario) {
					case "importado":
						resultado.funcionarios.importados++;
						console.log(
							`✅ Importado: ${funcionario.Nome} (CPF: ${funcionario.Cpf})`,
						);
						break;
					case "atualizado":
						resultado.funcionarios.atualizados++;
						console.log(
							`🔄 Atualizado: ${funcionario.Nome} (CPF: ${funcionario.Cpf})`,
						);
						break;
					case "ignorado":
						resultado.funcionarios.ignorados++;
						console.log(
							`ℹ️ Ignorado (já existe): ${funcionario.Nome} (CPF: ${funcionario.Cpf})`,
						);
						break;
					case "erro":
						resultado.funcionarios.erros.push(
							`Erro ao processar funcionário ${funcionario.Nome} (CPF: ${funcionario.Cpf})`,
						);
						break;
				}
			}

			console.log("\n📊 Relatório de Importação:");
			console.log("   🏢 Estruturas:");
			console.log(
				`      • Empresas: ${resultado.empresas.importadas} novas, ${resultado.empresas.atualizadas} atualizadas`,
			);
			console.log(
				`      • Unidades: ${resultado.unidades.importadas} novas, ${resultado.unidades.atualizadas} atualizadas`,
			);
			console.log(
				`      • Departamentos: ${resultado.departamentos.importadas} novos, ${resultado.departamentos.atualizadas} atualizados`,
			);
			console.log(
				`      • Cargos: ${resultado.cargos.importados} novos, ${resultado.cargos.atualizados} atualizados`,
			);
			console.log("   👥 Funcionários:");
			// console.log(`      • Processados: ${funcionariosProcessados}`);
			console.log(`      • Importados: ${resultado.funcionarios.importados}`);
			console.log(`      • Atualizados: ${resultado.funcionarios.atualizados}`);
			console.log(`      • Ignorados: ${resultado.funcionarios.ignorados}`);

			console.log("\n✅ Importação concluída!");
		} catch (error) {
			console.error("💥 Erro fatal:", error);
			throw error;
		}

		return resultado;
	}

	async sincronizarAfastamentos(diasRetroativos = 30): Promise<{
		afastamentos: number;
		erros: string[];
	}> {
		const resultado: {
			afastamentos: number;
			erros: string[];
		} = {
			afastamentos: 0,
			erros: [],
		};

		try {
			console.log("🔐 Autenticando no PontoWeb...");
			const client = await this.getPontowebClient();

			console.log(
				`📋 Buscando afastamentos dos últimos ${diasRetroativos} dias...`,
			);
			const afastamentos = await client.listaAfastamentos(diasRetroativos);

			console.log(
				`📊 Encontrados ${afastamentos.length} afastamentos no PontoWeb`,
			);

			// Aqui você implementaria a lógica para processar os afastamentos
			// Por enquanto, apenas contamos
			resultado.afastamentos = afastamentos.length;

			console.log("✅ Sincronização de afastamentos concluída!");
		} catch (error) {
			console.error("💥 Erro na sincronização de afastamentos:", error);
			resultado.erros.push((error as Error).message);
		}

		return resultado;
	}

	async obterMotivosDemissao(): Promise<{
		motivos: Array<{
			id: number;
			descricao: string;
			codigo?: string;
			ativo: boolean;
		}>;
		erros: string[];
	}> {
		const resultado: {
			motivos: Array<{
				id: number;
				descricao: string;
				codigo?: string;
				ativo: boolean;
			}>;
			erros: string[];
		} = {
			motivos: [],
			erros: [],
		};

		try {
			console.log("🔐 Autenticando no PontoWeb...");
			const client = await this.getPontowebClient();

			console.log("📋 Buscando motivos de demissão...");
			const motivos = await client.listMotivosDemissao();

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			resultado.motivos = motivos.map((motivo: any) => ({
				id: motivo.Id,
				descricao: motivo.Descricao,
				codigo: motivo.Codigo,
				ativo: motivo.Ativo,
			}));

			console.log(
				`✅ Encontrados ${resultado.motivos.length} motivos de demissão!`,
			);
		} catch (error) {
			console.error("💥 Erro ao obter motivos de demissão:", error);
			resultado.erros.push((error as Error).message);
		}

		return resultado;
	}
}
