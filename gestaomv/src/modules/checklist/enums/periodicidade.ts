// Enum
export const periodicidadeEnum = [
	"SEMANAL",
	"QUINZENAL",
	"MENSAL",
	"BIMESTRAL",
	"TRIMESTRAL",
	"SEMESTRAL",
	"ANUAL",
	"UNICA",
] as const;

// Type
export type Periodicidade = (typeof periodicidadeEnum)[number];

// Interface para dados
interface PeriodicidadeData {
	label: string;
	qtdDias?: number;
}

// Dados do status de avaliação
export const periodicidadeData: Record<Periodicidade, PeriodicidadeData> = {
	SEMANAL: {
		label: "Semanal",
		qtdDias: 7,
	},
	QUINZENAL: {
		label: "Quinzenal",
		qtdDias: 15,
	},
	MENSAL: {
		label: "Mensal",
		qtdDias: 30,
	},
	BIMESTRAL: {
		label: "Bimestral",
		qtdDias: 60,
	},
	TRIMESTRAL: {
		label: "Trimestral",
		qtdDias: 90,
	},
	SEMESTRAL: {
		label: "Semestral",
		qtdDias: 180,
	},
	ANUAL: {
		label: "Anual",
		qtdDias: 365,
	},
	UNICA: {
		label: "Unica",
	},
} as const;

// Opções para select
export const periodicidadeSelectOptions = periodicidadeEnum.map((item) => ({
	value: item,
	label: periodicidadeData[item].label,
}));
