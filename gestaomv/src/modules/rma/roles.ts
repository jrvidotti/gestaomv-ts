import type { UserRoleData } from "@/constants";

const USER_ROLES = {
	GERENCIA_RMA: "gerencia_rma",
	USUARIO_RMA: "usuario_rma",
} as const;

export const USER_ROLES_DATA: Record<
	(typeof USER_ROLES)[keyof typeof USER_ROLES],
	UserRoleData
> = {
	[USER_ROLES.GERENCIA_RMA]: {
		value: USER_ROLES.GERENCIA_RMA,
		label: "Gerente RMA",
		description: "Acesso de gerenciamento de RMA",
		color: "default",
	},
	[USER_ROLES.USUARIO_RMA]: {
		value: USER_ROLES.USUARIO_RMA,
		label: "Usuário RMA",
		description: "Acesso de usuário de RMA",
	},
} as const;

export const USER_ROLES_RMA = USER_ROLES;
export const USER_ROLES_RMA_DATA = USER_ROLES_DATA;
