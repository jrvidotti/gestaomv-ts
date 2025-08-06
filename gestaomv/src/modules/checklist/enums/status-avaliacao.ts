import type { Variant } from "@/lib/consts";

// Enum
export const statusAvaliacaoEnum = [
	"PENDENTE",
	"EM_ANDAMENTO",
	"CONCLUIDA",
	"CANCELADA",
] as const;

// Type
export type StatusAvaliacao = (typeof statusAvaliacaoEnum)[number];

// Interface para dados
interface StatusAvaliacaoData {
	label: string;
	variant: Variant;
}

// Dados do status de avaliação
export const statusAvaliacaoData: Record<StatusAvaliacao, StatusAvaliacaoData> =
	{
		PENDENTE: {
			label: "Pendente",
			variant: "default",
		},
		EM_ANDAMENTO: {
			label: "Em andamento",
			variant: "secondary",
		},
		CONCLUIDA: {
			label: "Concluída",
			variant: "accent",
		},
		CANCELADA: {
			label: "Cancelada",
			variant: "destructive",
		},
	} as const;

// Opções para select
export const statusAvaliacaoSelectOptions = statusAvaliacaoEnum.map((item) => ({
	value: item,
	label: statusAvaliacaoData[item].label,
}));
