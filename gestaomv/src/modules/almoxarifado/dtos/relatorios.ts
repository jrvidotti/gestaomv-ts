import { z } from "zod";

// ============ SCHEMAS DE DASHBOARD/ESTATÍSTICAS ============

export const filtroEstatisticasSchema = z.object({
	dataInicial: z.date().optional(),
	dataFinal: z.date().optional(),
	status: z.string().optional(),
});

export const topMateriaisSchema = z.object({
	limite: z
		.number()
		.min(1, "Limite deve ser maior que 0")
		.max(50, "Limite máximo é 50")
		.default(10),
	dataInicial: z.date().optional(),
	dataFinal: z.date().optional(),
	status: z.string().optional(),
});

// ============ TIPOS DERIVADOS ============

export type FiltroEstatisticas = z.infer<typeof filtroEstatisticasSchema>;
export type TopMateriaisParams = z.infer<typeof topMateriaisSchema>;

// ============ SCHEMAS DE RELATÓRIOS DE CONSUMO ============

export const relatorioConsumoFiltrosSchema = z.object({
	dataInicial: z.date().optional(),
	dataFinal: z.date().optional(),
	status: z.string().optional(),
	unidadeId: z.number().optional(),
	tipoMaterialId: z.string().optional(),
});

export const tipoRelatorioConsumoSchema = z.enum(["sintetico", "analitico"]);

// ============ TIPOS DERIVADOS ============

export type RelatorioConsumoFiltros = z.infer<
	typeof relatorioConsumoFiltrosSchema
>;
export type TipoRelatorioConsumo = z.infer<typeof tipoRelatorioConsumoSchema>;

// ============ INTERFACES DE RETORNO ============

export interface ConsumoSintetico {
	unidadeId: number;
	unidadeNome: string;
	tipoMaterialId: string;
	tipoMaterialNome: string;
	quantidadeTotal: number;
	valorTotal: number;
	numeroSolicitacoes: number;
}

export interface ConsumoAnalitico {
	unidadeId: number;
	unidadeNome: string;
	tipoMaterialId: string;
	tipoMaterialNome: string;
	materialId: number;
	materialNome: string;
	quantidadeTotal: number;
	valorUnitario: number;
	valorTotal: number;
	numeroSolicitacoes: number;
}

// ============ OUTROS ESQUEMAS ============

export interface EstatisticasAlmoxarifado {
	totalSolicitacoes: number;
	materiaisAtivos: number;
	unidadesAtivas: number;
	valorTotalSolicitado: number;
	solicitacoesPorStatus: {
		pendente: number;
		aprovada: number;
		rejeitada: number;
		atendida: number;
	};
}
