// Enum
export const tendenciaEnum = [
	"MELHOROU", // 4.5-5.0
	"MANTEVE", // 2.5-3.4
	"PIOROU", // 3.5-4.4
	"PRIMEIRA", // 1.0-1.4
] as const;

// Type
export type Tendencia = (typeof tendenciaEnum)[number];
