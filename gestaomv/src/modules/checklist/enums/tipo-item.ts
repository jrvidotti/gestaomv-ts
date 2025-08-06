import type { Variant } from "@/lib/consts";

// Enum
export const tipoItemChecklistEnum = [
	"NOTA_1_5", // Nota de 1 a 5
	"SIM_NAO", // Sim/Não
	"TEXTO", // Campo de texto livre
] as const;

// Type
export type TipoItemChecklist = (typeof tipoItemChecklistEnum)[number];

// Interface para dados
interface TipoItemData {
	label: string;
	variant: Variant;
}

// Dados do tipo de item
export const tipoItemData: Record<TipoItemChecklist, TipoItemData> = {
	NOTA_1_5: {
		label: "Nota de 1 a 5",
		variant: "default",
	},
	SIM_NAO: {
		label: "Sim/Não",
		variant: "secondary",
	},
	TEXTO: {
		label: "Campo de texto livre",
		variant: "accent",
	},
} as const;

// Opções para select
export const tipoItemSelectOptions = tipoItemChecklistEnum.map((item) => ({
	value: item,
	label: tipoItemData[item].label,
}));
