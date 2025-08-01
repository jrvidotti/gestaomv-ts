import type { STATUS_SOLICITACAO } from "./enums";
import type { materiais, tiposMaterial, unidadesMedida } from "./schemas";

export type StatusSolicitacaoType =
	(typeof STATUS_SOLICITACAO)[keyof typeof STATUS_SOLICITACAO];

export type TipoMaterial = typeof tiposMaterial.$inferSelect;

export type UnidadeMedida = typeof unidadesMedida.$inferSelect;

export type Material = typeof materiais.$inferSelect;

export type TopMaterialResult = {
	materialId: number;
	materialNome: string;
	materialTipo: string;
	valorUnitario: number;
	totalSolicitado: number;
	totalAtendido: number;
	valorTotal: number;
	numeroSolicitacoes: number;
};
