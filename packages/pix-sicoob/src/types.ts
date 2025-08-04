import { z } from "zod";

// Interface para logger customizado (compatível com Pino)
export interface Logger {
	debug(obj: any, msg?: string): void;
	info(obj: any, msg?: string): void;
	warn(obj: any, msg?: string): void;
	error(obj: any, msg?: string): void;
}

export interface SicoobAuthConfig {
	clientId: string;
	pfxBuffer: Buffer;
	pfxPassword: string;
	scope: string;
	baseUrl?: string;
	debug?: boolean;
	logger?: Logger; // Logger opcional
}

export interface SicoobAuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number; // in seconds
	scope: string;
}

export const infoAdicionalSchema = z.object({
	nome: z.string(),
	valor: z.string(),
});

export const devedorSchema = z.object({
	nome: z.string(),
	cpf: z.string().optional(),
	cnpj: z.string().optional(),
});

export const valorSchema = z.object({
	original: z
		.string()
		.regex(
			/^\d+\.\d{2}$/,
			"Valor deve ser numérico com duas casas decimais separadas por ponto",
		),
	modalidadeAlteracao: z.number().optional(),
});

export const CalendarioSchema = z.object({
	criacao: z.string().optional(),
	expiracao: z.number(),
});

export const cobPayloadSchema = z.object({
	calendario: CalendarioSchema,
	devedor: devedorSchema.optional(),
	valor: valorSchema,
	chave: z.string(),
	txid: z.string().optional(),
	solicitacaoPagador: z.string().optional(),
	infoAdicionais: z.array(infoAdicionalSchema).optional(),
});

export type CobPayload = z.infer<typeof cobPayloadSchema>;

export const cobResponseSchema = z.object({
	calendario: CalendarioSchema,
	devedor: devedorSchema.optional(),
	status: z.string(),
	txid: z.string(),
	revisao: z.number(),
	location: z.string(),
	valor: valorSchema,
	chave: z.string(),
	infoAdicionais: z.array(infoAdicionalSchema).optional(),
	brcode: z.string(),
});

export type CobResponse = z.infer<typeof cobResponseSchema>;

export const listPixQuerySchema = z.object({
	inicio: z.string().datetime(),
	fim: z.string().datetime(),
	cpf: z.string().optional(),
	cnpj: z.string().optional(),
	locationPresente: z.boolean().optional(),
	status: z.string().optional(),
	"paginacao.paginaAtual": z.number().optional(),
	"paginacao.itensPorPagina": z.number().optional(),
});

export type ListPixQuery = z.infer<typeof listPixQuerySchema>;

export const pixSchema = z.object({
	endToEndId: z.string(),
	txid: z.string(),
	valor: z.string(),
	horario: z.string().datetime(),
	nomePagador: z.string().optional(),
	pagador: z
		.object({
			nome: z.string(),
			cpf: z.string(),
		})
		.optional(),
	devolucoes: z.array(z.any()),
});

export const cobResponseWithPixSchema = z.object({
	brcode: z.string(),
	txid: z.string(),
	calendario: CalendarioSchema,
	status: z.string(),
	devedor: devedorSchema,
	chave: z.string(),
	valor: valorSchema,
	permiteAlteracao: z.boolean(),
	infoAdicionais: z.array(infoAdicionalSchema),
	payloadURL: z.string(),
	pix: z.array(pixSchema),
});

export type CobResponseWithPix = z.infer<typeof cobResponseWithPixSchema>;

export const listPixResponseSchema = z.object({
	parametros: z.object({
		inicio: z.string().datetime(),
		fim: z.string().datetime(),
		cpf: z.string().optional(),
		cnpj: z.string().optional(),
		locationPresente: z.boolean().optional(),
		status: z.string().optional(),
		paginacao: z.object({
			paginaAtual: z.number(),
			itensPorPagina: z.number(),
			quantidadeDePaginas: z.number(),
			quantidadeTotalDeItens: z.number(),
		}),
	}),
	cobs: z.array(cobResponseWithPixSchema),
});

export type ListPixResponse = z.infer<typeof listPixResponseSchema>;

const webhookPayload = {
	pix: [
		{
			endToEndId: "E0000000020250429165342751287687",
			txid: "TR32QW5QQBDTZL036328721745945595545",
			valor: "1.00",
			horario: "2025-04-29T16:54:02.017Z",
			devolucoes: [],
		},
	],
};

export const webhookPixPayloadSchema = z.object({
	pix: z.array(pixSchema),
});

export type WebhookPixPayload = z.infer<typeof webhookPixPayloadSchema>;
export type PixRecebido = z.infer<typeof pixSchema>;
