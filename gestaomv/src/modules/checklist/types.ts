import type { InferSelectModel } from "drizzle-orm";
import type { Unidade, User } from "../core/types";
import type {
	ClassificacaoNota,
	Periodicidade,
	Tendencia,
	TipoItemChecklist,
} from "./enums";
import type {
	checklistAvaliacoes,
	checklistItems,
	checklistRespostas,
	checklistTemplates,
} from "./schemas";

export type RespostaPaginada<T> = {
	data: T[];
	total: number;
	pagina: number;
	limite: number;
	totalPaginas: number;
};

// Types baseados nos schemas do banco
export type ChecklistTemplate = InferSelectModel<typeof checklistTemplates> & {
	criadoPor?: Partial<User>;
	itens?: Partial<ChecklistItem>[];
	avaliacoes?: Partial<ChecklistAvaliacao>[];
	_count?: {
		itens: number;
		avaliacoes: number;
	};
};
export type ChecklistItem = InferSelectModel<typeof checklistItems>;

export type ChecklistAvaliacao = InferSelectModel<
	typeof checklistAvaliacoes
> & {
	template?: Partial<ChecklistTemplate>;
	unidade?: Partial<Unidade>;
	avaliador?: Partial<User>;
	respostas?: Partial<ChecklistResposta>[];
};
export type ChecklistResposta = InferSelectModel<typeof checklistRespostas>;

// Types para formulários e DTOs
export type CreateChecklistTemplateData = {
	nome: string;
	descricao?: string;
	periodicidade: Periodicidade;
	ativo: boolean;
	itens: Array<{
		titulo: string;
		descricao?: string;
		tipo: TipoItemChecklist;
		obrigatorio: boolean;
		peso: number;
		ordem: number;
	}>;
};

export type CreateAvaliacaoData = {
	templateId: number;
	unidadeId: number;
	observacoes?: string;
	dataAgendada?: string;
	respostas: Array<{
		itemId: number;
		valorNota?: number;
		valorBoolean?: boolean;
		valorTexto?: string;
	}>;
};

// Types para relatórios
export type RelatorioAvaliacao = {
	avaliacaoId: number;
	templateNome: string;
	unidadeNome: string;
	avaliadorNome: string;
	dataAvaliacao: string;
	mediaFinal: number;
	classificacao: ClassificacaoNota;
	totalItens: number;
	itensRespondidos: number;
};

export type ComparativoUnidades = {
	unidadeId: number;
	unidadeNome: string;
	totalAvaliacoes: number;
	mediaGeral: number;
	classificacaoGeral: ClassificacaoNota;
	ultimaAvaliacao?: string;
	tendencia: Tendencia;
};
