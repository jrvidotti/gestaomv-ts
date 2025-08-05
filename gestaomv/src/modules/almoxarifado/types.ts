import type { Unidade, User } from "@/modules/core/types";
import type { STATUS_SOLICITACAO } from "./enums";
import type {
	materiais,
	solicitacoesMaterial,
	solicitacoesMaterialItens,
	tiposMaterial,
	unidadesMedida,
} from "./schemas";

export type StatusSolicitacaoType =
	(typeof STATUS_SOLICITACAO)[keyof typeof STATUS_SOLICITACAO];

export type TipoMaterial = typeof tiposMaterial.$inferSelect;

export type UnidadeMedida = typeof unidadesMedida.$inferSelect;

export type Material = typeof materiais.$inferSelect & {
	tipoMaterial?: Partial<TipoMaterial>;
	unidadeMedida?: Partial<UnidadeMedida>;
};

export type SolicitacaoMaterialItem =
	typeof solicitacoesMaterialItens.$inferSelect & {
		material?: Partial<Material>;
	};

export type SolicitacaoMaterial = typeof solicitacoesMaterial.$inferSelect & {
	solicitante?: Partial<User>;
	unidade?: Partial<Unidade>;
	aprovador?: Partial<User> | null;
	atendidoPor?: Partial<User> | null;
	itens?: Array<Partial<SolicitacaoMaterialItem>>;
};

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
