import z from "zod";
import { STATUS_SOLICITACAO, STATUS_SOLICITACAO_ARRAY } from "../enums";

export const itemSolicitacaoSchema = z.object({
	materialId: z.number().min(1, "Material é obrigatório"),
	qtdSolicitada: z.number().min(1, "Quantidade deve ser maior que zero"),
});

export const criarSolicitacaoMaterialSchema = z.object({
	unidadeId: z.number().min(1, "Unidade é obrigatória"),
	observacoes: z
		.string()
		.max(500, "Observações devem ter no máximo 500 caracteres")
		.optional(),
	itens: z
		.array(itemSolicitacaoSchema)
		.min(1, "Deve haver pelo menos um item na solicitação")
		.max(50, "Máximo de 50 itens por solicitação"),
});

export const itemAtualizarSolicitacaoSchema = z.object({
	id: z.number().min(1, "ID do item é obrigatório"),
	qtdAtendida: z
		.number()
		.min(0, "Quantidade deve ser maior ou igual a zero")
		.optional(),
});

export const atualizarSolicitacaoSchema = z.object({
	status: z.enum([STATUS_SOLICITACAO.APROVADA, STATUS_SOLICITACAO.REJEITADA]),
	motivoRejeicao: z
		.string()
		.max(500, "Motivo da rejeição deve ter no máximo 500 caracteres")
		.optional(),
	itens: z.array(itemAtualizarSolicitacaoSchema).optional(),
});

export const itemAtenderSolicitacaoSchema = z.object({
	id: z.number().min(1, "ID do item é obrigatório"),
	qtdAtendida: z
		.number()
		.min(0, "Quantidade atendida deve ser maior ou igual a zero"),
});

export const atenderSolicitacaoSchema = z.object({
	itens: z
		.array(itemAtenderSolicitacaoSchema)
		.min(1, "Deve haver pelo menos um item para atender"),
});

export const filtroSolicitacoesSchema = z.object({
	status: z.enum(STATUS_SOLICITACAO_ARRAY).optional(),
	unidadeId: z.number().min(1).optional(),
	solicitanteId: z.number().min(1).optional(),
	dataInicial: z.date().optional(),
	dataFinal: z.date().optional(),
	pagina: z.number().min(1, "Página deve ser maior que 0").default(1),
	limite: z
		.number()
		.min(1, "Limite deve ser maior que 0")
		.max(100, "Limite máximo é 100")
		.default(20),
});

// Schema para formulário de nova solicitação
export const formNovaSolicitacaoSchema = z.object({
	unidadeId: z
		.string()
		.min(1, "Unidade é obrigatória")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			if (Number.isNaN(num) || num < 1) {
				throw new Error("Unidade deve ser selecionada");
			}
			return num;
		}),
	observacoes: z
		.string()
		.max(500, "Observações devem ter no máximo 500 caracteres")
		.optional(),
	itens: z
		.array(
			z.object({
				materialId: z
					.string()
					.min(1, "Material é obrigatório")
					.transform((val) => {
						const num = Number.parseInt(val, 10);
						if (Number.isNaN(num) || num < 1) {
							throw new Error("Material deve ser selecionado");
						}
						return num;
					}),
				qtdSolicitada: z
					.string()
					.min(1, "Quantidade é obrigatória")
					.transform((val) => {
						const num = Number.parseInt(val, 10);
						if (Number.isNaN(num) || num < 1) {
							throw new Error("Quantidade deve ser maior que zero");
						}
						return num;
					}),
			}),
		)
		.min(1, "Deve haver pelo menos um item na solicitação")
		.max(50, "Máximo de 50 itens por solicitação"),
});

// ============ TIPOS DERIVADOS ============

export type CriarSolicitacaoMaterialData = z.infer<
	typeof criarSolicitacaoMaterialSchema
>;
export type AtualizarSolicitacaoData = z.infer<
	typeof atualizarSolicitacaoSchema
>;
export type AtenderSolicitacaoData = z.infer<typeof atenderSolicitacaoSchema>;
export type FiltrosSolicitacoes = z.infer<typeof filtroSolicitacoesSchema>;

export type FormNovaSolicitacaoData = z.infer<typeof formNovaSolicitacaoSchema>;
