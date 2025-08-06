import { z } from "zod";
import { classificacaoNotaEnum, statusAvaliacaoEnum } from "../enums";

// Schemas base

export const statusAvaliacaoSchema = z.enum(statusAvaliacaoEnum);
export const classificacaoNotaSchema = z.enum(classificacaoNotaEnum);

// Schema para resposta de item
export const checklistRespostaSchema = z.object({
	itemId: z.number().int().positive(),
	valorNota: z
		.number()
		.int()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5")
		.optional(),
	valorBoolean: z.boolean().optional(),
	valorTexto: z.string().max(1000, "Texto muito longo").optional(),
	observacao: z.string().max(500, "Observação muito longa").optional(),
});

// Schema para criar avaliação
export const createAvaliacaoSchema = z.object({
	templateId: z.number().int().positive("Template ID é obrigatório"),
	unidadeId: z.number().int().positive("Unidade ID é obrigatória"),
	dataAgendada: z.string().datetime().optional(),
	observacoes: z.string().max(1000, "Observações muito longas").optional(),
	respostas: z.array(checklistRespostaSchema),
});

// Schema para atualizar avaliação
export const updateAvaliacaoSchema = z.object({
	id: z.number().int().positive(),
	status: statusAvaliacaoSchema.optional(),
	observacoes: z.string().max(1000, "Observações muito longas").optional(),
	respostas: z.array(checklistRespostaSchema).optional(),
});

// Schema para finalizar avaliação
export const finalizarAvaliacaoSchema = z.object({
	id: z.number().int().positive(),
	observacoes: z.string().max(1000, "Observações muito longas").optional(),
	respostas: z
		.array(checklistRespostaSchema)
		.min(1, "Deve ter pelo menos uma resposta"),
});

// Schema para listar avaliações
export const listAvaliacoesSchema = z.object({
	templateId: z.number().int().positive().optional(),
	unidadeId: z.number().int().positive().optional(),
	avaliadorId: z.number().int().positive().optional(),
	status: z.union([statusAvaliacaoSchema, z.literal("")]).optional(),
	classificacao: z.union([classificacaoNotaSchema, z.literal("")]).optional(),
	dataInicio: z.union([z.string().date(), z.literal("")]).optional(),
	dataFim: z.union([z.string().date(), z.literal("")]).optional(),
	pagina: z.number().int().min(1).default(1),
	limite: z.number().int().min(1).max(100).default(20),
});

// Schema para buscar avaliação por ID
export const getAvaliacaoSchema = z.object({
	id: z.number().int().positive("ID deve ser um número positivo"),
});

// Schema para deletar avaliação
export const deleteAvaliacaoSchema = z.object({
	id: z.number().int().positive("ID deve ser um número positivo"),
});

// Schema para relatório de avaliações
export const relatorioAvaliacoesSchema = z.object({
	templateId: z.number().int().positive().optional(),
	unidadeId: z.number().int().positive().optional(),
	dataInicio: z.union([z.string().date(), z.literal("")]).optional(),
	dataFim: z.union([z.string().date(), z.literal("")]).optional(),
	agruparPor: z
		.enum(["template", "unidade", "avaliador", "mes"])
		.default("unidade"),
});

// Schema para comparativo entre unidades
export const comparativoUnidadesSchema = z.object({
	templateId: z.number().int().positive().optional(),
	dataInicio: z.union([z.string().date(), z.literal("")]).optional(),
	dataFim: z.union([z.string().date(), z.literal("")]).optional(),
	unidadeIds: z.array(z.number().int().positive()).optional(),
});
