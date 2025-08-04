import axios, { AxiosInstance, isAxiosError } from "axios";
import https from "https";
import qs from "qs";
import { z } from "zod";
import {
	CobPayload,
	cobPayloadSchema,
	CobResponse,
	ListPixQuery,
	ListPixResponse,
	SicoobAuthConfig,
	SicoobAuthResponse,
	Logger,
} from "./types";

/**
 * Cliente PIX para integração com API do Sicoob
 *
 * @example
 * ```typescript
 * import { SicoobPixClient } from '@movelabs/pix-sicoob';
 * import fs from 'fs';
 *
 * const client = new SicoobPixClient({
 *   clientId: 'seu-client-id',
 *   pfxBuffer: fs.readFileSync('certificado.pfx'),
 *   pfxPassword: 'senha-do-certificado',
 *   scope: 'cob.write cob.read webhook.read webhook.write',
 *   debug: true
 * });
 *
 * // Criar cobrança PIX
 * const cobranca = await client.createPixCob({
 *   calendario: { expiracao: 3600 },
 *   valor: { original: '10.50' },
 *   chave: 'sua-chave-pix@email.com',
 *   solicitacaoPagador: 'Pagamento do pedido #123'
 * });
 * ```
 */
export class SicoobPixClient {
	private axiosInstanceAuth: AxiosInstance;
	private axiosInstancePix: AxiosInstance;
	private config: SicoobAuthConfig;
	private authResponse?: SicoobAuthResponse;
	private tokenExpiresAt?: number;
	private debug: boolean;
	private logger?: Logger;

	constructor(config: SicoobAuthConfig) {
		this.config = config;
		this.debug = config.debug ?? false;
		this.logger = config.logger;

		const httpsAgent = new https.Agent({
			pfx: config.pfxBuffer,
			passphrase: this.config.pfxPassword,
		});

		this.axiosInstanceAuth = axios.create({
			baseURL: "https://auth.sicoob.com.br",
			httpsAgent: httpsAgent,
			timeout: 5000,
		});

		this.axiosInstancePix = axios.create({
			baseURL: this.config.baseUrl ?? "https://api.sicoob.com.br/pix/api/v2",
			httpsAgent: httpsAgent,
			timeout: 5000,
		});
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
			`[${timestamp}] [SICOOB] [${level.toUpperCase()}] ${message}${logData}`,
		);
	}

	public async getAccessToken(): Promise<string> {
		this.log("debug", "Obtendo token de acesso", {
			clientId: this.config.clientId.substring(0, 8) + "...",
		});

		try {
			if (!this.isTokenValid()) {
				const data = {
					client_id: this.config.clientId,
					grant_type: "client_credentials",
					scope: this.config.scope,
				};

				const response = await this.axiosInstanceAuth.post<SicoobAuthResponse>(
					"/auth/realms/cooperado/protocol/openid-connect/token",
					qs.stringify(data),
					{
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
					},
				);

				this.authResponse = response.data;

				this.tokenExpiresAt =
					Date.now() + (this.authResponse.expires_in - 60) * 1000;

				this.log("info", "Token de acesso obtido com sucesso", {
					expiresIn: this.authResponse.expires_in,
					scope: this.authResponse.scope,
				});
			}

			return this.authResponse!.access_token;
		} catch (error) {
			if (isAxiosError(error)) {
				this.log("error", "Erro de autenticação", {
					status: error.response?.status,
					data: error.response?.data,
				});
			} else {
				this.log("error", "Erro desconhecido na autenticação", { error });
			}
			throw new Error("Erro ao obter token de acesso");
		}
	}

	public isTokenValid(): boolean {
		if (!this.authResponse) {
			this.log("debug", "Nenhuma resposta de autenticação disponível");
			return false;
		}
		if (!this.tokenExpiresAt) {
			this.log("debug", "Nenhum timestamp de expiração definido");
			return false;
		}
		if (Date.now() >= this.tokenExpiresAt) {
			this.log("debug", "Token expirado", {
				expiresAt: new Date(this.tokenExpiresAt).toISOString(),
			});
			return false;
		}
		return true;
	}

	public getTokenInfo(): {
		token_type: string;
		scope: string;
		expires_in: number;
		expiresAt: Date;
		isValid: boolean;
	} | null {
		if (!this.authResponse || !this.tokenExpiresAt) {
			return null;
		}

		return {
			token_type: this.authResponse.token_type,
			scope: this.authResponse.scope,
			expires_in: this.authResponse.expires_in,
			expiresAt: new Date(this.tokenExpiresAt),
			isValid: this.isTokenValid(),
		};
	}

	private async getAuthHeaders() {
		return {
			client_id: this.config.clientId,
			Authorization: `Bearer ${await this.getAccessToken()}`,
			"Content-Type": "application/json",
			accept: "application/json",
		};
	}

	public async getWebhook(chave: string): Promise<{
		webhookUrl: string;
		chave: string;
		criacao: string;
	}> {
		this.log("debug", "Consultando webhook", { chave });

		const response = await this.axiosInstancePix.get(`/webhook/${chave}`, {
			headers: await this.getAuthHeaders(),
		});

		this.log("info", "Webhook consultado com sucesso", {
			chave,
			webhookUrl: response.data.webhookUrl,
		});

		return response.data;
	}

	public async setWebhook(chave: string, webhookUrl: string): Promise<void> {
		this.log("info", "Configurando webhook", { chave, webhookUrl });

		await this.axiosInstancePix.put(
			`/webhook/${chave}`,
			{
				webhookUrl,
			},
			{
				headers: await this.getAuthHeaders(),
			},
		);

		this.log("info", "Webhook configurado com sucesso", { chave, webhookUrl });
	}

	public async deleteWebhook(chave: string): Promise<void> {
		this.log("info", "Removendo webhook", { chave });

		await this.axiosInstancePix.delete(`/webhook/${chave}`, {
			headers: await this.getAuthHeaders(),
		});

		this.log("info", "Webhook removido com sucesso", { chave });
	}

	public async createPixCob(data: CobPayload): Promise<CobResponse> {
		let validatedData: CobPayload | undefined;
		let headers: Record<string, string> | undefined;

		try {
			validatedData = cobPayloadSchema.parse(data);
			headers = await this.getAuthHeaders();

			this.log("debug", "Criando cobrança PIX", {
				valor: validatedData.valor.original,
				chave: validatedData.chave,
				solicitacaoPagador: validatedData.solicitacaoPagador,
			});

			const response = await this.axiosInstancePix.post(`/cob`, validatedData, {
				headers,
			});

			this.log("info", "Cobrança PIX criada com sucesso", {
				txid: response.data.txid,
				valor: response.data.valor?.original,
				status: response.data.status,
			});

			return response.data;
		} catch (error) {
			if (error instanceof z.ZodError) {
				this.log("error", "Erro de validação ao criar cobrança PIX", {
					errors: error.errors,
				});
				throw new Error("Dados inválidos");
			}
			if (isAxiosError(error)) {
				this.log("error", "Erro HTTP ao criar cobrança PIX", {
					status: error.response?.status,
					data: error.response?.data,
				});
				throw new Error(
					`Erro ao criar cobrança PIX no Sicoob: ${JSON.stringify(
						error.response?.data,
						null,
						2,
					)}`,
				);
			}
			this.log("error", "Erro desconhecido ao criar cobrança PIX", { error });
			throw new Error("Erro ao criar cobrança PIX");
		}
	}

	public async getPixCob(txid: string): Promise<CobResponse> {
		this.log("debug", "Consultando cobrança PIX", { txid });

		const response = await this.axiosInstancePix.get(`/cob/${txid}`, {
			headers: await this.getAuthHeaders(),
		});

		this.log("info", "Cobrança PIX consultada com sucesso", {
			txid,
			status: response.data.status,
			valor: response.data.valor?.original,
		});

		return response.data;
	}

	public async getPixCobImagem(txid: string): Promise<Blob> {
		try {
			this.log("debug", "Obtendo imagem QR Code", { txid });

			const response = await this.axiosInstancePix.get(`/cob/${txid}/imagem`, {
				headers: {
					...(await this.getAuthHeaders()),
					Accept: "image/png",
				},
			});

			this.log("info", "Imagem QR Code obtida com sucesso", { txid });

			return response.data;
		} catch (error) {
			this.log("error", "Erro ao obter imagem QR Code do PIX", { txid, error });
			throw new Error("Erro ao obter imagem QR Code do PIX");
		}
	}

	public async listPix(query: ListPixQuery): Promise<ListPixResponse> {
		this.log("debug", "Listando cobranças PIX", { query });

		const response = await this.axiosInstancePix.get(`/cob`, {
			headers: await this.getAuthHeaders(),
			params: query,
		});

		this.log("info", "Cobranças PIX listadas com sucesso", {
			parametros: query,
			total: response.data.cobs?.length || 0,
		});

		return response.data;
	}
}

// Exportar tipos e classes
export * from "./types";
export { SicoobPixClient as default };
