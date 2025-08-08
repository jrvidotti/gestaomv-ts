import { z } from "zod";
import { STATUS_CLIENTE_ARRAY, TIPOS_REFERENCIA_ARRAY } from "../enums";

// Schema para contato de referência
export const contatoReferenciaSchema = z
	.object({
		tipoReferencia: z.enum(TIPOS_REFERENCIA_ARRAY),
		pessoaId: z.number().positive().optional(), // Se vinculado a pessoa existente
		nomeCompleto: z.string().optional(),
		telefone: z.string().min(10, "Telefone é obrigatório"),
		email: z.email("E-mail inválido").optional(),
		documento: z.string().optional(),
		empresaOrganizacao: z.string().optional(),
		cargoFuncao: z.string().optional(),
		observacoes: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		// Se não tem pessoaId vinculada, nome completo é obrigatório
		if (!data.pessoaId && !data.nomeCompleto) {
			ctx.addIssue({
				code: "custom",
				message: "Nome completo é obrigatório quando não há pessoa vinculada",
				path: ["nomeCompleto"],
			});
		}

		// Para referências comerciais, documento é obrigatório
		if (data.tipoReferencia === "referencia_comercial" && !data.documento) {
			ctx.addIssue({
				code: "custom",
				message: "Documento é obrigatório para referências comerciais",
				path: ["documento"],
			});
		}
	});

// Schema para criar cliente
export const createClienteSchema = z
	.object({
		pessoaId: z.number().positive("ID da pessoa é obrigatório"),
		status: z.enum(STATUS_CLIENTE_ARRAY).default("ativo"),
		observacoesCliente: z.string().optional(),
		creditoAutorizado: z.boolean().default(false),
		limiteCredito: z
			.number()
			.min(0, "Limite de crédito deve ser zero ou positivo")
			.default(0),
		taxaJurosPadrao: z
			.number()
			.min(0)
			.max(100, "Taxa de juros deve estar entre 0% e 100%")
			.default(0),
		tarifaDevolucaoCheques: z.number().optional(),
		tarifaProrrogacao: z.number().optional(),
		tarifaProtesto: z.number().optional(),
		tarifaResgate: z.number().optional(),
		dataUltimaAnaliseCredito: z.date().optional(),
		usuarioResponsavelAnalise: z.number().positive().optional(),
		contatosReferencia: z.array(contatoReferenciaSchema),
	})
	.superRefine((data, ctx) => {
		// Se crédito autorizado, limite deve ser maior que zero
		if (data.creditoAutorizado && data.limiteCredito <= 0) {
			ctx.addIssue({
				code: "custom",
				message:
					"Limite de crédito deve ser maior que zero para clientes autorizados",
				path: ["limiteCredito"],
			});
		}
	});

export const updateClienteSchema = createClienteSchema.partial().extend({
	id: z.number().positive(),
});

export const findClienteSchema = z.object({
	id: z.number().positive(),
});

export const listClientesSchema = z.object({
	page: z.number().positive().default(1),
	limit: z.number().min(1).max(100).default(20),
	search: z.string().optional(),
	status: z.enum(STATUS_CLIENTE_ARRAY).optional(),
	creditoAutorizado: z.boolean().optional(),
});

// Schema para análise de crédito
export const analiseCreditoSchema = z.object({
	clienteId: z.number().positive(),
	novoLimite: z.number().min(0, "Limite deve ser zero ou positivo"),
	creditoAutorizado: z.boolean(),
	taxaJurosPadrao: z
		.number()
		.min(0)
		.max(100, "Taxa deve estar entre 0% e 100%"),
	observacoes: z.string().optional(),
});

// Schema para histórico de limite
export const historicoLimiteSchema = z.object({
	data: z.date(),
	limiteAnterior: z.number(),
	novoLimite: z.number(),
	usuario: z.string(),
	motivo: z.string(),
});

// Tipos
export type CreateClienteDto = z.infer<typeof createClienteSchema>;
export type UpdateClienteDto = z.infer<typeof updateClienteSchema>;
export type FindClienteDto = z.infer<typeof findClienteSchema>;
export type ListClientesDto = z.infer<typeof listClientesSchema>;
export type ContatoReferenciaDto = z.infer<typeof contatoReferenciaSchema>;
export type AnaliseCreditoDto = z.infer<typeof analiseCreditoSchema>;
export type HistoricoLimiteDto = z.infer<typeof historicoLimiteSchema>;
