import type { Db } from "@/db";
import { addYears } from "date-fns";
import { eq, lt } from "drizzle-orm";
import { consultasCnpj, consultasCpf } from "../schemas";

export class DirectDataService {
	constructor(private db: Db) {}

	private mapearDadosApiParaSistema(dadosApi: any, cpfOriginal: string) {
		// Helper para verificar se valor é válido (não vazio, não null, não undefined)
		const isValidValue = (value: any) => value?.trim && value.trim() !== "";

		// Verificar se tem endereços válidos
		const enderecoPrincipal =
			dadosApi.enderecos?.length > 0 ? dadosApi.enderecos[0] : null;

		// Verificar se tem emails válidos
		const emailPrincipal =
			dadosApi.emails?.length > 0 && dadosApi.emails[0]?.enderecoEmail
				? dadosApi.emails[0].enderecoEmail
				: null;

		return {
			tipoPessoa: "fisica" as const,
			documento: dadosApi.cpf || cpfOriginal,
			nomeRazaoSocial: dadosApi.nome || "",
			nomeMae: dadosApi.nomeMae || undefined,
			dataNascimentoFundacao: dadosApi.dataNascimento
				? new Date(dadosApi.dataNascimento)
				: undefined,
			sexo:
				dadosApi.sexo?.toLowerCase() === "masculino"
					? ("masculino" as const)
					: dadosApi.sexo?.toLowerCase() === "feminino"
						? ("feminino" as const)
						: ("nao_informado" as const),
			email: isValidValue(emailPrincipal) ? emailPrincipal : undefined,
			// Endereço principal (primeiro da lista) - só preencher se válido
			cep:
				enderecoPrincipal && isValidValue(enderecoPrincipal.cep)
					? enderecoPrincipal.cep
					: undefined,
			logradouro:
				enderecoPrincipal && isValidValue(enderecoPrincipal.logradouro)
					? enderecoPrincipal.logradouro
					: undefined,
			numero:
				enderecoPrincipal && isValidValue(enderecoPrincipal.numero)
					? enderecoPrincipal.numero
					: undefined,
			complemento:
				enderecoPrincipal && isValidValue(enderecoPrincipal.complemento)
					? enderecoPrincipal.complemento
					: undefined,
			bairro:
				enderecoPrincipal && isValidValue(enderecoPrincipal.bairro)
					? enderecoPrincipal.bairro
					: undefined,
			cidade:
				enderecoPrincipal && isValidValue(enderecoPrincipal.cidade)
					? enderecoPrincipal.cidade
					: undefined,
			estado:
				enderecoPrincipal && isValidValue(enderecoPrincipal.uf)
					? enderecoPrincipal.uf
					: undefined,
			// Telefones mapeados - filtrar telefones válidos
			telefones:
				dadosApi.telefones
					?.filter(
						(tel: any) =>
							tel.telefoneComDDD && tel.telefoneComDDD.trim() !== "",
					)
					.map((tel: any, index: number) => ({
						numero: tel.telefoneComDDD,
						tipo:
							tel.tipoTelefone === "TELEFONE MÓVEL" ||
							tel.tipoTelefone === "Celular"
								? ("celular" as const)
								: ("fixo" as const),
						principal: index === 0, // Primeiro telefone como principal
						inativo: false,
						whatsapp: tel.whatsApp || false,
						observacoes: tel.operadora
							? `Operadora: ${tel.operadora}`
							: undefined,
					})) || [],
		};
	}

	private mapearDadosApiParaSistemaPJ(dadosApi: any, cnpjOriginal: string) {
		// Helper para verificar se valor é válido (não vazio, não null, não undefined)
		const isValidValue = (value: any) => value?.trim && value.trim() !== "";

		// Verificar se tem endereços válidos
		const enderecoPrincipal =
			dadosApi.enderecos?.length > 0 ? dadosApi.enderecos[0] : null;

		// Verificar se tem emails válidos
		const emailPrincipal =
			dadosApi.emails?.length > 0 && dadosApi.emails[0]?.enderecoEmail
				? dadosApi.emails[0].enderecoEmail
				: null;

		return {
			tipoPessoa: "juridica" as const,
			documento: dadosApi.cnpj || cnpjOriginal,
			nomeRazaoSocial: dadosApi.razaoSocial || "",
			nomeFantasia: dadosApi.nomeFantasia || undefined,
			dataNascimentoFundacao: dadosApi.dataFundacao
				? new Date(dadosApi.dataFundacao)
				: undefined,
			email: isValidValue(emailPrincipal) ? emailPrincipal : undefined,
			// Endereço principal (primeiro da lista) - só preencher se válido
			cep:
				enderecoPrincipal && isValidValue(enderecoPrincipal.cep)
					? enderecoPrincipal.cep
					: undefined,
			logradouro:
				enderecoPrincipal && isValidValue(enderecoPrincipal.logradouro)
					? enderecoPrincipal.logradouro
					: undefined,
			numero:
				enderecoPrincipal && isValidValue(enderecoPrincipal.numero)
					? enderecoPrincipal.numero
					: undefined,
			complemento:
				enderecoPrincipal && isValidValue(enderecoPrincipal.complemento)
					? enderecoPrincipal.complemento
					: undefined,
			bairro:
				enderecoPrincipal && isValidValue(enderecoPrincipal.bairro)
					? enderecoPrincipal.bairro
					: undefined,
			cidade:
				enderecoPrincipal && isValidValue(enderecoPrincipal.cidade)
					? enderecoPrincipal.cidade
					: undefined,
			estado:
				enderecoPrincipal && isValidValue(enderecoPrincipal.uf)
					? enderecoPrincipal.uf
					: undefined,
			// Telefones mapeados - filtrar telefones válidos
			telefones:
				dadosApi.telefones
					?.filter(
						(tel: any) =>
							tel.telefoneComDDD && tel.telefoneComDDD.trim() !== "",
					)
					.map((tel: any, index: number) => ({
						numero: tel.telefoneComDDD,
						tipo:
							tel.tipoTelefone === "TELEFONE MÓVEL" ||
							tel.tipoTelefone === "Celular"
								? ("celular" as const)
								: ("fixo" as const),
						principal: index === 0, // Primeiro telefone como principal
						inativo: false,
						whatsapp: tel.whatsApp || false,
						observacoes: tel.operadora
							? `Operadora: ${tel.operadora}`
							: undefined,
					})) || [],
			// Metadados específicos de PJ
			cnae: dadosApi.cnaeCodigo
				? {
						codigo: dadosApi.cnaeCodigo,
						descricao: dadosApi.cnaeDescricao,
					}
				: undefined,
			situacaoCadastral: dadosApi.situacaoCadastral || undefined,
			naturezaJuridica: dadosApi.naturezaJuridicaDescricao || undefined,
			porte: dadosApi.porte || undefined,
		};
	}

	async consultarCpf(cpf: string) {
		const documentoLimpo = cpf.replace(/\D/g, "");

		// Validar se é CPF (11 dígitos)
		if (documentoLimpo.length !== 11) {
			return {
				fonte: "erro" as const,
				dados: null,
				erro: "Documento deve ter 11 dígitos para consulta CPF",
			};
		}

		// Verificar cache (expira em 2 anos)
		const cacheExistente = await this.db.query.consultasCpf.findFirst({
			where: eq(consultasCpf.cpf, documentoLimpo),
		});

		console.log("Cache existente CPF:", documentoLimpo, !!cacheExistente);

		if (cacheExistente) {
			const dataCache = new Date(cacheExistente.criadoEm || "");
			const dataExpiracao = addYears(dataCache, 2);

			// Se cache ainda válido, retornar dados em cache
			if (new Date() < dataExpiracao) {
				const dadosCache = JSON.parse(cacheExistente.dados);
				console.log("Dados em cache CPF:", documentoLimpo, dadosCache);

				// Se dados estão no formato da API (dados brutos), mapear para formato do sistema
				if (dadosCache.cpf && dadosCache.nome) {
					// Dados brutos da API - mapear usando método dedicado
					const dadosMapeados = this.mapearDadosApiParaSistema(dadosCache, cpf);

					return {
						fonte: "cache" as const,
						dados: dadosMapeados,
						metadados: {
							rendaEstimada: dadosCache.rendaEstimada,
							rendaFaixaSalarial: dadosCache.rendaFaixaSalarial,
							idade: dadosCache.idade,
							signo: dadosCache.signo,
						},
						criadoEm: cacheExistente.criadoEm,
					};
				}
				// Dados já estão no formato mapeado
				return {
					fonte: "cache" as const,
					dados: dadosCache,
					criadoEm: cacheExistente.criadoEm,
				};
			}

			// Cache expirado, remover registro antigo
			await this.db
				.delete(consultasCpf)
				.where(eq(consultasCpf.cpf, documentoLimpo));
		}

		// Buscar na API Direct Data
		try {
			const { ApiDirectDataClient } = await import("@movelabs/api-direct-data");
			const { env } = await import("@/env");

			if (!env.DIRECTDATA_TOKEN) {
				return {
					fonte: "erro" as const,
					dados: null,
					erro: "Token da API Direct Data não configurado",
				};
			}

			const client = new ApiDirectDataClient({
				token: env.DIRECTDATA_TOKEN,
				baseUrl: env.DIRECTDATA_URL,
				debug: env.NODE_ENV === "development",
			});

			const resultado = await client.consultarCadastroPessoaFisica({
				cpf: documentoLimpo,
			});

			if (resultado.retorno) {
				const dadosApi = resultado.retorno;

				// Mapear dados da API para estrutura do sistema usando método dedicado
				const dadosMapeados = this.mapearDadosApiParaSistema(dadosApi, cpf);

				// Salvar no cache (dados mapeados para o sistema)
				await this.db.insert(consultasCpf).values({
					cpf: documentoLimpo,
					dados: JSON.stringify(dadosMapeados),
				});

				return {
					fonte: "api_direct_data" as const,
					dados: dadosMapeados,
					metadados: {
						rendaEstimada: dadosApi.rendaEstimada,
						rendaFaixaSalarial: dadosApi.rendaFaixaSalarial,
						idade: dadosApi.idade,
						signo: dadosApi.signo,
					},
				};
			}

			return {
				fonte: "nao_encontrado" as const,
				dados: null,
				mensagem:
					resultado.metaDados?.mensagem || "Dados não encontrados na API",
			};
		} catch (error) {
			return {
				fonte: "erro" as const,
				dados: null,
				erro: error instanceof Error ? error.message : "Erro desconhecido",
				mensagem:
					"Erro ao consultar API Direct Data. Verifique o documento e tente novamente.",
			};
		}
	}

	async consultarCnpj(cnpj: string) {
		const documentoLimpo = cnpj.replace(/\D/g, "");

		// Validar se é CNPJ (14 dígitos)
		if (documentoLimpo.length !== 14) {
			return {
				fonte: "erro" as const,
				dados: null,
				erro: "Documento deve ter 14 dígitos para consulta CNPJ",
			};
		}

		// Verificar cache (expira em 2 anos)
		const cacheExistente = await this.db.query.consultasCnpj.findFirst({
			where: eq(consultasCnpj.cnpj, documentoLimpo),
		});

		console.log("Cache existente CNPJ:", documentoLimpo, !!cacheExistente);

		if (cacheExistente) {
			const dataCache = new Date(cacheExistente.criadoEm || "");
			const dataExpiracao = addYears(dataCache, 2);

			// Se cache ainda válido, retornar dados em cache
			if (new Date() < dataExpiracao) {
				const dadosCache = JSON.parse(cacheExistente.dados);
				console.log("Dados em cache CNPJ:", documentoLimpo, dadosCache);

				// Se dados estão no formato da API (dados brutos), mapear para formato do sistema
				if (dadosCache.cnpj && dadosCache.razaoSocial) {
					// Dados brutos da API - mapear usando método dedicado
					const dadosMapeados = this.mapearDadosApiParaSistemaPJ(
						dadosCache,
						cnpj,
					);

					return {
						fonte: "cache" as const,
						dados: dadosMapeados,
						metadados: {
							situacaoCadastral: dadosCache.situacaoCadastral,
							porte: dadosCache.porte,
							naturezaJuridica: dadosCache.naturezaJuridicaDescricao,
							cnae: dadosCache.cnaeDescricao,
						},
						criadoEm: cacheExistente.criadoEm,
					};
				}
				// Dados já estão no formato mapeado
				return {
					fonte: "cache" as const,
					dados: dadosCache,
					criadoEm: cacheExistente.criadoEm,
				};
			}

			// Cache expirado, remover registro antigo
			await this.db
				.delete(consultasCnpj)
				.where(eq(consultasCnpj.cnpj, documentoLimpo));
		}

		// Buscar na API Direct Data
		try {
			const { ApiDirectDataClient } = await import("@movelabs/api-direct-data");
			const { env } = await import("@/env");

			if (!env.DIRECTDATA_TOKEN) {
				return {
					fonte: "erro" as const,
					dados: null,
					erro: "Token da API Direct Data não configurado",
				};
			}

			const client = new ApiDirectDataClient({
				token: env.DIRECTDATA_TOKEN,
				baseUrl: env.DIRECTDATA_URL,
				debug: env.NODE_ENV === "development",
			});

			const resultado = await client.consultarCadastroPessoaJuridica({
				cnpj: documentoLimpo,
			});

			if (resultado.retorno) {
				const dadosApi = resultado.retorno;

				// Mapear dados da API para estrutura do sistema usando método dedicado
				const dadosMapeados = this.mapearDadosApiParaSistemaPJ(dadosApi, cnpj);

				// Salvar no cache (dados mapeados para o sistema)
				await this.db.insert(consultasCnpj).values({
					cnpj: documentoLimpo,
					dados: JSON.stringify(dadosMapeados),
				});

				return {
					fonte: "api_direct_data" as const,
					dados: dadosMapeados,
					metadados: {
						situacaoCadastral: dadosApi.situacaoCadastral,
						porte: dadosApi.porte,
						naturezaJuridica: dadosApi.naturezaJuridicaDescricao,
						cnae: dadosApi.cnaeDescricao,
						quantidadeFuncionarios: dadosApi.quantidadeFuncionarios,
						faixaFaturamento: dadosApi.faixaFaturamento,
					},
				};
			}

			return {
				fonte: "nao_encontrado" as const,
				dados: null,
				mensagem:
					resultado.metaDados?.mensagem || "Dados não encontrados na API",
			};
		} catch (error) {
			return {
				fonte: "erro" as const,
				dados: null,
				erro: error instanceof Error ? error.message : "Erro desconhecido",
				mensagem:
					"Erro ao consultar API Direct Data. Verifique o documento e tente novamente.",
			};
		}
	}

	// Método para limpar cache expirado (opcional - pode ser chamado periodicamente)
	async limparCacheExpirado() {
		const dataLimite = addYears(new Date(), -2);
		await this.db
			.delete(consultasCpf)
			.where(lt(consultasCpf.criadoEm, dataLimite.toISOString()));
		await this.db
			.delete(consultasCnpj)
			.where(lt(consultasCnpj.criadoEm, dataLimite.toISOString()));
	}
}
