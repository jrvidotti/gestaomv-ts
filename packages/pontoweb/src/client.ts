import { addDays } from "date-fns";
import type { Afastamento } from "./dto/afastamento.dto";
import type { Funcionario } from "./dto/funcionario.dto";
import type { MotivoDemissao } from "./dto/motivo-demissao.dto";

export class PontoWebClient {
	private token: string;

	constructor(token: string) {
		this.token = token;
	}

	/**
	 * Inicializa o cliente do PontoWeb com autenticação
	 */
	static async init(
		username: string,
		password: string,
	): Promise<PontoWebClient> {
		const url = "https://autenticador.secullum.com.br/Token";
		const payload = {
			grant_type: "password",
			username: username,
			password: password,
			client_id: "3",
		};

		const response = await fetch(url, {
			method: "POST",
			body: new URLSearchParams(payload),
		});

		const data = (await response.json()) as { access_token?: string };

		if (!data.access_token) {
			throw new Error(`Erro ao autenticar no Pontoweb: ${response.status}`);
		}

		return new PontoWebClient(data.access_token);
	}

	/**
	 * Executa uma requisição GET para a API do PontoWeb
	 */
	private async get(
		url: string,
		params?: Record<string, string>,
	): Promise<any> {
		const headers = {
			"Content-Type": "application/json",
			Authorization: "Bearer " + this.token,
		};

		const query = new URLSearchParams(params).toString();
		const fullUrl =
			`https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna${url}` +
			(query ? "?" + query : "");

		const response = await fetch(fullUrl, {
			method: "GET",
			headers: headers,
		});

		if (!response.ok) {
			throw new Error(
				`Erro na requisição: ${response.status} - ${response.statusText}`,
			);
		}

		return await response.json();
	}

	/**
	 * Lista todos os motivos de demissão disponíveis
	 */
	async listMotivosDemissao(): Promise<MotivoDemissao[]> {
		return await this.get("/MotivosDemissao");
	}

	/**
	 * Lista todos os funcionários com informações completas
	 */
	async listaFuncionarios(): Promise<Funcionario[]> {
		const motivosDemissao = await this.listMotivosDemissao();
		const funcionarios = await this.get("/Funcionarios");

		return funcionarios.map((f: any) => ({
			...f,
			ExpedicaoRg: this.dateOrNull(f.ExpedicaoRg),
			Nascimento: this.dateOrNull(f.Nascimento),
			Admissao: this.dateOrNull(f.Admissao),
			Demissao: this.dateOrNull(f.Demissao),
			DataUltimoEnvio: this.dateOrNull(f.DataUltimoEnvio),
			DataAlteracao: this.dateOrNull(f.DataAlteracao),
			MotivoDemissao: motivosDemissao.find((m) => m.Id === f.MotivoDemissaoId)
				?.Descricao,
		}));
	}

	/**
	 * Lista afastamentos dos funcionários em um período específico
	 * @param dias Número de dias para buscar afastamentos (a partir de hoje - dias)
	 */
	async listaAfastamentos(dias: number): Promise<Afastamento[]> {
		const afastamentos = await this.get("/FuncionariosAfastamentos", {
			dataInicio: addDays(new Date(), -dias).toISOString().slice(0, 10),
			dataFim: addDays(new Date(), 1000).toISOString().slice(0, 10),
		});

		return afastamentos.map((a: any) => ({
			...a,
			Inicio: this.dateOrNull(a.Inicio),
			Fim: this.dateOrNull(a.Fim),
			DataInclusao: this.dateOrNull(a.DataInclusao),
		}));
	}

	/**
	 * Converte uma string de data para Date ou retorna undefined se inválida
	 */
	private dateOrNull(dt: Date | string | null): Date | undefined {
		return dt ? new Date(dt) : undefined;
	}
}
