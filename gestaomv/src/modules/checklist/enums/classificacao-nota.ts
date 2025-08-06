import type { Variant } from "@/lib/consts";

// Enum
export const classificacaoNotaEnum = [
	"EXCELENTE", // 4.5-5.0
	"BOM", // 3.5-4.4
	"REGULAR", // 2.5-3.4
	"RUIM", // 1.5-2.4
	"PESSIMO", // 1.0-1.4
] as const;

// Type
export type ClassificacaoNota = (typeof classificacaoNotaEnum)[number];

// Interface para dados
interface ClassificacaoNotaData {
	label: string;
	variant: Variant;
}

// Dados do tipo de item
export const classificacaoNotaData: Record<
	ClassificacaoNota,
	ClassificacaoNotaData
> = {
	EXCELENTE: {
		label: "Excelente",
		variant: "success",
	},
	BOM: {
		label: "Bom",
		variant: "secondary",
	},
	REGULAR: {
		label: "Regular",
		variant: "default",
	},
	RUIM: {
		label: "Ruim",
		variant: "destructive",
	},
	PESSIMO: {
		label: "Pessimo",
		variant: "destructive",
	},
} as const;

// Opções para select
export const classificacaoNotaSelectOptions = classificacaoNotaEnum.map(
	(item) => ({
		value: item,
		label: classificacaoNotaData[item].label,
	}),
);
