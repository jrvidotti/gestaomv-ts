import { STATUS_SOLICITACAO } from "./enums";
import type { StatusSolicitacaoType } from "./types";

export interface StatusSolicitacaoData {
	value: StatusSolicitacaoType;
	label: string;
	description: string;
	variant:
		| "default"
		| "secondary"
		| "destructive"
		| "outline"
		| "accent"
		| "success";
	color: string;
}

export const STATUS_SOLICITACAO_DATA: Record<
	StatusSolicitacaoType,
	StatusSolicitacaoData
> = {
	[STATUS_SOLICITACAO.PENDENTE]: {
		value: STATUS_SOLICITACAO.PENDENTE,
		label: "Pendente",
		description: "Aguardando aprovação",
		variant: "accent",
		color: "blue",
	},
	[STATUS_SOLICITACAO.APROVADA]: {
		value: STATUS_SOLICITACAO.APROVADA,
		label: "Aprovada",
		description: "Aguardando aprovação",
		variant: "secondary",
		color: "blue",
	},
	[STATUS_SOLICITACAO.REJEITADA]: {
		value: STATUS_SOLICITACAO.REJEITADA,
		label: "Rejeitada",
		description: "Aguardando aprovação",
		variant: "destructive",
		color: "blue",
	},
	[STATUS_SOLICITACAO.CANCELADA]: {
		value: STATUS_SOLICITACAO.CANCELADA,
		label: "Cancelada",
		description: "Aguardando aprovação",
		variant: "destructive",
		color: "blue",
	},
	[STATUS_SOLICITACAO.ATENDIDA]: {
		value: STATUS_SOLICITACAO.ATENDIDA,
		label: "Atendida",
		description: "Aguardando aprovação",
		variant: "success",
		color: "blue",
	},
};

export const STATUS_OPTIONS = [
	{ value: "all", label: "Todos os status" },
	...Object.values(STATUS_SOLICITACAO_DATA).map((status) => ({
		value: status.value,
		label: status.label,
	})),
];
