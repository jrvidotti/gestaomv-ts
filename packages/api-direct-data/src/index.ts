import axios, { type AxiosInstance, isAxiosError } from "axios";
import { z } from "zod";
import {
	type ApiDirectDataConfig,
	type CadastroPessoaFisicaQuery,
	type CadastroPessoaFisicaResponse,
	type CadastroPessoaJuridicaQuery,
	type CadastroPessoaJuridicaResponse,
	type Logger,
	cadastroPessoaFisicaQuerySchema,
	cadastroPessoaJuridicaQuerySchema,
} from "./types";

export class ApiDirectDataClient {
	private axiosInstance: AxiosInstance;
	private config: ApiDirectDataConfig;
	private debug: boolean;
	private logger?: Logger;

	constructor(config: ApiDirectDataConfig) {
		this.config = config;
		this.debug = config.debug ?? false;
		this.logger = config.logger;

		this.axiosInstance = axios.create({
			baseURL: this.config.baseUrl ?? "https://apiv3.directd.com.br",
			timeout: this.config.timeout ?? 30000,
		});
	}

	private getHeaders() {
		return {
			"Content-Type": "application/json",
			Accept: "application/json",
		};
	}

	private log(
		level: "debug" | "info" | "warn" | "error",
		message: string,
		data?: any,
	) {
		if (this.logger) {
			this.logger[level](data || {}, message);
			return;
		}

		if (!this.debug && level === "debug") return;

		const timestamp = new Date().toISOString();
		const logData = data ? ` ${JSON.stringify(data)}` : "";
		console.log(
			`[${timestamp}] [API_DIRECT_DATA] [${level.toUpperCase()}] ${message}${logData}`,
		);
	}

	/**
	 * Converte data do formato DD/MM/YYYY HH:mm:ss para ISO
	 * @param dateString - Data no formato DD/MM/YYYY HH:mm:ss
	 * @returns Data no formato ISO ou null se inválida
	 */
	private convertDateToISO(
		dateString: string | null | undefined,
	): string | null {
		if (!dateString) return null;

		try {
			// Remove horário se existir (mantém apenas DD/MM/YYYY)
			const dateOnly = dateString.split(" ")[0] ?? "";

			// Verifica se está no formato DD/MM/YYYY
			const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
			const match = dateOnly.match(dateRegex);

			if (!match) return null;

			const [, day, month, year] = match;

			// Cria data no formato ISO (YYYY-MM-DD)
			const isoDate = `${year}-${month}-${day}`;

			// Valida se a data é válida
			const date = new Date(isoDate);
			if (Number.isNaN(date.getTime())) return null;

			return isoDate;
		} catch (error) {
			this.log("warn", "Erro ao converter data", {
				dateString,
				error: error instanceof Error ? error.message : String(error),
			});
			return null;
		}
	}

	/**
	 * Processa a resposta da API convertendo datas para formato ISO
	 * @param response - Resposta da API
	 * @returns Resposta com datas convertidas
	 */
	private processResponse(
		response: CadastroPessoaFisicaResponse,
	): CadastroPessoaFisicaResponse {
		const processedResponse = { ...response };

		// Converter data de nascimento no retorno principal
		if (processedResponse.retorno?.dataNascimento) {
			processedResponse.retorno.dataNascimento = this.convertDateToISO(
				processedResponse.retorno.dataNascimento,
			);
		}

		// Converter data nos metadados se existir
		if (processedResponse.metaDados?.data) {
			processedResponse.metaDados.data = this.convertDateToISO(
				processedResponse.metaDados.data,
			);
		}

		return processedResponse;
	}

	/**
	 * Processa a resposta da API de PJ convertendo datas para formato ISO
	 * @param response - Resposta da API de pessoa jurídica
	 * @returns Resposta com datas convertidas
	 */
	private processResponsePJ(
		response: CadastroPessoaJuridicaResponse,
	): CadastroPessoaJuridicaResponse {
		const processedResponse = { ...response };

		// Converter data de fundação no retorno principal
		if (processedResponse.retorno?.dataFundacao) {
			processedResponse.retorno.dataFundacao = this.convertDateToISO(
				processedResponse.retorno.dataFundacao,
			);
		}

		// Converter ultima atualização PJ se existir
		if (processedResponse.retorno?.ultimaAtualizacaoPJ) {
			processedResponse.retorno.ultimaAtualizacaoPJ = this.convertDateToISO(
				processedResponse.retorno.ultimaAtualizacaoPJ,
			);
		}

		// Converter data de entrada dos sócios
		if (processedResponse.retorno?.socios) {
			processedResponse.retorno.socios = processedResponse.retorno.socios.map(
				(socio) => ({
					...socio,
					dataEntrada: socio.dataEntrada
						? this.convertDateToISO(socio.dataEntrada)
						: socio.dataEntrada,
				}),
			);
		}

		// Converter data nos metadados se existir
		if (processedResponse.metaDados?.data) {
			processedResponse.metaDados.data = this.convertDateToISO(
				processedResponse.metaDados.data,
			);
		}

		return processedResponse;
	}

	/**
	 * Realiza a consulta Cadastro - Pessoa Física - Básica
	 * @param query - Os parâmetros da consulta (CPF e TOKEN)
	 * @returns A resposta da API com os dados da pessoa física
	 */
	public async consultarCadastroPessoaFisica(
		query: CadastroPessoaFisicaQuery,
	): Promise<CadastroPessoaFisicaResponse> {
		let validatedQuery: CadastroPessoaFisicaQuery | undefined;

		try {
			validatedQuery = cadastroPessoaFisicaQuerySchema.parse(query);

			this.log("debug", "Consultando cadastro pessoa física", {
				cpf: validatedQuery.cpf.replace(/\d/g, "*"),
			});

			const response = await this.axiosInstance.get(
				"/api/CadastroPessoaFisica",
				{
					headers: this.getHeaders(),
					params: {
						CPF: validatedQuery.cpf,
						TOKEN: this.config.token,
					},
				},
			);

			// Processar resposta convertendo datas para formato ISO
			const processedResponse = this.processResponse(response.data);

			this.log("info", "Consulta realizada com sucesso", {
				cpf: validatedQuery.cpf.replace(/\d/g, "*"),
				hasRetorno: !!processedResponse.retorno,
				mensagem: processedResponse.metaDados?.mensagem,
			});

			return processedResponse;
		} catch (error) {
			if (error instanceof z.ZodError) {
				this.log("error", "Dados inválidos para consulta", {
					errors: error.errors,
				});
				throw new Error("Dados inválidos para consulta de pessoa física");
			}
			if (isAxiosError(error)) {
				this.log("error", "Erro ao consultar pessoa física", {
					cpf: validatedQuery?.cpf.replace(/\d/g, "*"),
					status: error.response?.status,
					message: error.response?.data?.metaDados?.mensagem,
				});
				throw new Error(
					`Erro ao consultar pessoa física: ${
						error.response?.data?.metaDados?.mensagem ||
						error.response?.statusText ||
						error.message
					}`,
				);
			}
			this.log("error", "Erro desconhecido na consulta", {
				error: error instanceof Error ? error.message : String(error),
			});
			throw new Error("Erro ao consultar pessoa física");
		}
	}

	/**
	 * Realiza a consulta Cadastro - Pessoa Jurídica - Básica
	 * @param query - Os parâmetros da consulta (CNPJ e TOKEN)
	 * @returns A resposta da API com os dados da pessoa jurídica
	 */
	public async consultarCadastroPessoaJuridica(
		query: CadastroPessoaJuridicaQuery,
	): Promise<CadastroPessoaJuridicaResponse> {
		let validatedQuery: CadastroPessoaJuridicaQuery | undefined;

		try {
			validatedQuery = cadastroPessoaJuridicaQuerySchema.parse(query);

			this.log("debug", "Consultando cadastro pessoa jurídica", {
				cnpj: validatedQuery.cnpj.replace(/\d/g, "*"),
			});

			const response = await this.axiosInstance.get(
				"/api/CadastroPessoaJuridica",
				{
					headers: this.getHeaders(),
					params: {
						CNPJ: validatedQuery.cnpj,
						TOKEN: this.config.token,
					},
				},
			);

			// Processar resposta convertendo datas para formato ISO
			const processedResponse = this.processResponsePJ(response.data);

			this.log("info", "Consulta realizada com sucesso", {
				cnpj: validatedQuery.cnpj.replace(/\d/g, "*"),
				hasRetorno: !!processedResponse.retorno,
				mensagem: processedResponse.metaDados?.mensagem,
			});

			return processedResponse;
		} catch (error) {
			if (error instanceof z.ZodError) {
				this.log("error", "Dados inválidos para consulta", {
					errors: error.errors,
				});
				throw new Error("Dados inválidos para consulta de pessoa jurídica");
			}
			if (isAxiosError(error)) {
				this.log("error", "Erro ao consultar pessoa jurídica", {
					cnpj: validatedQuery?.cnpj.replace(/\d/g, "*"),
					status: error.response?.status,
					message: error.response?.data?.metaDados?.mensagem,
				});
				throw new Error(
					`Erro ao consultar pessoa jurídica: ${
						error.response?.data?.metaDados?.mensagem ||
						error.response?.statusText ||
						error.message
					}`,
				);
			}
			this.log("error", "Erro desconhecido na consulta", {
				error: error instanceof Error ? error.message : String(error),
			});
			throw new Error("Erro ao consultar pessoa jurídica");
		}
	}
}

export * from "./types";
