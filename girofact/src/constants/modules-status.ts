// Module Status Constants
export const MODULE_STATUS = {
	ATIVO: "ativo",
	DESENVOLVIMENTO: "desenvolvimento",
	PLANEJADO: "planejado",
	DESABILITADO: "desabilitado",
} as const;

export type ModuleStatus = (typeof MODULE_STATUS)[keyof typeof MODULE_STATUS];

// Module Status Map
export const MODULE_STATUS_MAP = {
	[MODULE_STATUS.ATIVO]: {
		value: MODULE_STATUS.ATIVO,
		label: "Ativo",
		color: "bg-green-500",
		textColor: "text-green-700",
		bgColor: "bg-green-50",
	},
	[MODULE_STATUS.DESENVOLVIMENTO]: {
		value: MODULE_STATUS.DESENVOLVIMENTO,
		label: "Em Desenvolvimento",
		color: "bg-yellow-500",
		textColor: "text-yellow-700",
		bgColor: "bg-yellow-50",
	},
	[MODULE_STATUS.PLANEJADO]: {
		value: MODULE_STATUS.PLANEJADO,
		label: "Planejado",
		color: "bg-blue-500",
		textColor: "text-blue-700",
		bgColor: "bg-blue-50",
	},
	[MODULE_STATUS.DESABILITADO]: {
		value: MODULE_STATUS.DESABILITADO,
		label: "Desabilitado",
		color: "bg-gray-500",
		textColor: "text-gray-700",
		bgColor: "bg-gray-50",
	},
} as const;

export const MODULE_STATUS_ARRAY = Object.values(MODULE_STATUS) as [
	string,
	...string[],
];
