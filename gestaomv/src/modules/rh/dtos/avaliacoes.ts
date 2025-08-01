import z from "zod";
import {
	classificacaoAvaliacaoPeriodicaEnum,
	recomendacaoAvaliacaoEnum,
	tipoAvaliacaoExperienciaEnum,
} from "../enums";

export const criarAvaliacaoExperienciaSchema = z.object({
	funcionarioId: z.number().min(1, "Funcionário é obrigatório"),
	tipo: z.enum(tipoAvaliacaoExperienciaEnum),
	dataAvaliacao: z.string().min(1, "Data da avaliação é obrigatória"),
	pontualidade: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	comprometimento: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	trabalhoEquipe: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	iniciativa: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	comunicacao: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	conhecimentoTecnico: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	recomendacao: z.enum(recomendacaoAvaliacaoEnum),
	pontosFortes: z
		.string()
		.max(1000, "Pontos fortes devem ter no máximo 1000 caracteres")
		.optional(),
	pontosMelhoria: z
		.string()
		.max(1000, "Pontos de melhoria devem ter no máximo 1000 caracteres")
		.optional(),
	observacoes: z
		.string()
		.max(1000, "Observações devem ter no máximo 1000 caracteres")
		.optional(),
});

export const atualizarAvaliacaoExperienciaSchema =
	criarAvaliacaoExperienciaSchema.partial().extend({
		mediaFinal: z.number().min(1).max(5).optional(),
	});

export const filtrosAvaliacoesExperienciaSchema = z.object({
	funcionarioId: z.number().min(1).optional(),
	avaliadorId: z.number().min(1).optional(),
	tipo: z.enum(tipoAvaliacaoExperienciaEnum).optional(),
	recomendacao: z.enum(recomendacaoAvaliacaoEnum).optional(),
	dataInicial: z.string().optional(),
	dataFinal: z.string().optional(),
	pagina: z.number().min(1, "Página deve ser maior que 0").default(1),
	limite: z
		.number()
		.min(1, "Limite deve ser maior que 0")
		.max(100, "Limite máximo é 100")
		.default(20),
});

// ============ SCHEMAS DE AVALIAÇÕES PERIÓDICAS ============

export const criarAvaliacaoPeriodicaSchema = z.object({
	funcionarioId: z.number().min(1, "Funcionário é obrigatório"),
	periodoInicial: z.string().min(1, "Período inicial é obrigatório"),
	periodoFinal: z.string().min(1, "Período final é obrigatório"),
	dataAvaliacao: z.string().min(1, "Data da avaliação é obrigatória"),
	desempenho: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	comprometimento: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	trabalhoEquipe: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	lideranca: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	comunicacao: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	inovacao: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	resolucaoProblemas: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	qualidadeTrabalho: z
		.number()
		.min(1, "Nota deve ser entre 1 e 5")
		.max(5, "Nota deve ser entre 1 e 5"),
	metasAnterior: z
		.string()
		.max(2000, "Metas anteriores devem ter no máximo 2000 caracteres")
		.optional(),
	avaliacaoMetas: z
		.string()
		.max(2000, "Avaliação de metas deve ter no máximo 2000 caracteres")
		.optional(),
	novasMetas: z
		.string()
		.max(2000, "Novas metas devem ter no máximo 2000 caracteres")
		.optional(),
	feedbackGeral: z
		.string()
		.max(2000, "Feedback geral deve ter no máximo 2000 caracteres")
		.optional(),
	planoDesenvolvimento: z
		.string()
		.max(2000, "Plano de desenvolvimento deve ter no máximo 2000 caracteres")
		.optional(),
});

export const atualizarAvaliacaoPeriodicaSchema = criarAvaliacaoPeriodicaSchema
	.partial()
	.extend({
		mediaFinal: z.number().min(1).max(5).optional(),
		classificacao: z.enum(classificacaoAvaliacaoPeriodicaEnum).optional(),
	});

export const filtrosAvaliacoesPeriodicasSchema = z.object({
	funcionarioId: z.number().min(1).optional(),
	avaliadorId: z.number().min(1).optional(),
	classificacao: z.enum(classificacaoAvaliacaoPeriodicaEnum).optional(),
	periodoInicial: z.string().optional(),
	periodoFinal: z.string().optional(),
	dataInicial: z.string().optional(),
	dataFinal: z.string().optional(),
	pagina: z.number().min(1, "Página deve ser maior que 0").default(1),
	limite: z
		.number()
		.min(1, "Limite deve ser maior que 0")
		.max(100, "Limite máximo é 100")
		.default(20),
});

// ============ SCHEMAS PARA FORMULÁRIOS DO FRONTEND ============

// Schema para formulário de avaliação de experiência
export const formCriarAvaliacaoExperienciaSchema = z.object({
	funcionarioId: z
		.string()
		.min(1, "Funcionário é obrigatório")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			if (Number.isNaN(num) || num < 1) {
				throw new Error("Funcionário deve ser selecionado");
			}
			return num;
		}),
	tipo: z.enum(tipoAvaliacaoExperienciaEnum),
	dataAvaliacao: z.string().min(1, "Data da avaliação é obrigatória"),
	pontualidade: z
		.string()
		.min(1, "Nota é obrigatória")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			if (Number.isNaN(num) || num < 1 || num > 5) {
				throw new Error("Nota deve ser entre 1 e 5");
			}
			return num;
		}),
	comprometimento: z
		.string()
		.min(1, "Nota é obrigatória")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			if (Number.isNaN(num) || num < 1 || num > 5) {
				throw new Error("Nota deve ser entre 1 e 5");
			}
			return num;
		}),
	trabalhoEquipe: z
		.string()
		.min(1, "Nota é obrigatória")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			if (Number.isNaN(num) || num < 1 || num > 5) {
				throw new Error("Nota deve ser entre 1 e 5");
			}
			return num;
		}),
	iniciativa: z
		.string()
		.min(1, "Nota é obrigatória")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			if (Number.isNaN(num) || num < 1 || num > 5) {
				throw new Error("Nota deve ser entre 1 e 5");
			}
			return num;
		}),
	comunicacao: z
		.string()
		.min(1, "Nota é obrigatória")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			if (Number.isNaN(num) || num < 1 || num > 5) {
				throw new Error("Nota deve ser entre 1 e 5");
			}
			return num;
		}),
	conhecimentoTecnico: z
		.string()
		.min(1, "Nota é obrigatória")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			if (Number.isNaN(num) || num < 1 || num > 5) {
				throw new Error("Nota deve ser entre 1 e 5");
			}
			return num;
		}),
	recomendacao: z.enum(recomendacaoAvaliacaoEnum),
	pontosFortes: z
		.string()
		.max(1000, "Pontos fortes devem ter no máximo 1000 caracteres")
		.transform((val) => val.trim())
		.optional(),
	pontosMelhoria: z
		.string()
		.max(1000, "Pontos de melhoria devem ter no máximo 1000 caracteres")
		.transform((val) => val.trim())
		.optional(),
	observacoes: z
		.string()
		.max(1000, "Observações devem ter no máximo 1000 caracteres")
		.transform((val) => val.trim())
		.optional(),
});

// ============ TIPOS DERIVADOS ============

// Avaliações
export type CriarAvaliacaoExperienciaData = z.infer<
	typeof criarAvaliacaoExperienciaSchema
>;
export type AtualizarAvaliacaoExperienciaData = z.infer<
	typeof atualizarAvaliacaoExperienciaSchema
>;
export type FiltrosAvaliacoesExperiencia = z.infer<
	typeof filtrosAvaliacoesExperienciaSchema
>;

export type CriarAvaliacaoPeriodicaData = z.infer<
	typeof criarAvaliacaoPeriodicaSchema
>;
export type AtualizarAvaliacaoPeriodicaData = z.infer<
	typeof atualizarAvaliacaoPeriodicaSchema
>;
export type FiltrosAvaliacoesPeriodicas = z.infer<
	typeof filtrosAvaliacoesPeriodicasSchema
>;

// Formulários
export type FormCriarAvaliacaoExperienciaData = z.infer<
	typeof formCriarAvaliacaoExperienciaSchema
>;

// ============ TYPE ALIASES PARA ENUMS ============
