import { z } from "zod";
import {
	STATUS_OPERACAO,
	STATUS_OPERACAO_ARRAY,
	TIPOS_DOCUMENTO_ARRAY,
} from "../enums";

// Schema para criar operação - modo rascunho
export const upsertOperacaoSchema = z.object({
	uid: z.string(), // Chave gerada utilizando cuid2
	clienteId: z.number().positive("ID do cliente é obrigatório"),
	taxaJuros: z.number().min(0).max(100, "Taxa deve estar entre 0% e 100%"),
	observacoes: z.string().optional(),
});

// Schema para documento da operação
export const upsertDocumentoSchema = z
	.object({
		uidOperacao: z.string(),
		uidDocumento: z.string(),
		tipoDocumento: z.enum(TIPOS_DOCUMENTO_ARRAY),
		dataVencimento: z.date(),
		valorDocumento: z.number().positive("Valor deve ser positivo"),
		float: z.number().min(0, "Float deve ser zero ou positivo").default(0),
		observacoes: z.string().optional(),

		// Campos específicos para Nota Promissória
		emitenteId: z.number().positive().optional(),
		avalistaId: z.number().positive().optional(),
		numeroDocumento: z.string().optional(),

		// Campos específicos para Cheque
		dadosBancariosId: z.number().positive().optional(),
		numeroCheque: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		const hoje = new Date();
		if (data.dataVencimento <= hoje) {
			ctx.addIssue({
				code: "custom",
				message: "Data de vencimento deve ser futura",
				path: ["dataVencimento"],
			});
		}

		// Validações específicas por tipo de documento
		if (data.tipoDocumento === "nota_promissoria") {
			if (!data.emitenteId) {
				ctx.addIssue({
					code: "custom",
					message: "Emitente é obrigatório para nota promissória",
					path: ["emitenteId"],
				});
			}
		} else if (data.tipoDocumento === "cheque") {
			if (!data.dadosBancariosId) {
				ctx.addIssue({
					code: "custom",
					message: "Dados bancários são obrigatórios para cheque",
					path: ["dadosBancariosId"],
				});
			}
			if (!data.numeroCheque) {
				ctx.addIssue({
					code: "custom",
					message: "Número do cheque é obrigatório",
					path: ["numeroCheque"],
				});
			}
		}
	});

// Schema para remover documento de operação rascunho
export const removeDocumentoSchema = z.object({
	uidOperacao: z.string(),
	uidDocumento: z.string(),
});

// Schema para efetivar operação (rascunho para aprovacao/efetivada OU aprovacao para efetivada)
export const efetivarOperacaoSchema = z.object({
	uid: z.string(),
	status: z.enum([STATUS_OPERACAO.APROVACAO, STATUS_OPERACAO.EFETIVADA]),
});

// Schema para cancelar operação (rascunho/aprovacao/efetivada para cancelada)
export const cancelarOperacaoSchema = z.object({
	uid: z.string(),
	observacoes: z.string().optional(),
});

// Schema para liquidar operação (efetivada para liquidada)
export const liquidarOperacaoSchema = z.object({
	uid: z.string(),
	dataPagamento: z.date(),
	carteiraId: z.number().positive(),
	observacoes: z.string().optional(),
});

// Schema para listar documentos de uma operação
export const findOperacaoSchema = z.object({
	uid: z.string(),
});

export const listOperacoesSchema = z.object({
	page: z.number().positive().default(1),
	limit: z.number().min(1).max(100).default(20),
	search: z.string().optional(),
	clienteId: z.number().positive().optional(),
	carteiraId: z.number().positive().optional(),
	status: z.enum(STATUS_OPERACAO_ARRAY).optional(),
	dataInicio: z.date().optional(),
	dataFim: z.date().optional(),
	usuarioId: z.number().positive().optional(),
});

// Schema para relatório de operações
export const relatorioOperacoesSchema = z.object({
	dataInicio: z.date(),
	dataFim: z.date(),
	clienteId: z.number().positive().optional(),
	carteiraId: z.number().positive().optional(),
	status: z.enum(STATUS_OPERACAO_ARRAY).optional(),
	usuarioId: z.number().positive().optional(),
	agruparPor: z.enum(["cliente", "carteira", "usuario", "status"]).optional(),
});

// Tipos
export type UpsertOperacaoDto = z.infer<typeof upsertOperacaoSchema>;
export type UpsertDocumentoDto = z.infer<typeof upsertDocumentoSchema>;
export type RemoveDocumentoDto = z.infer<typeof removeDocumentoSchema>;
export type LiquidarOperacaoDto = z.infer<typeof liquidarOperacaoSchema>;
export type CancelarOperacaoDto = z.infer<typeof cancelarOperacaoSchema>;
export type EfetivarOperacaoDto = z.infer<typeof efetivarOperacaoSchema>;
export type UpdateDocumentoDto = z.infer<typeof upsertDocumentoSchema>;
export type FindOperacaoDto = z.infer<typeof findOperacaoSchema>;
export type ListOperacoesDto = z.infer<typeof listOperacoesSchema>;
export type RelatorioOperacoesDto = z.infer<typeof relatorioOperacoesSchema>;
