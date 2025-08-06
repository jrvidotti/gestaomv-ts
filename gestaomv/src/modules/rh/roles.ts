import type { UserRoleData } from "@/constants";

export const USER_ROLES = {
	GERENCIA_RH: "gerencia_rh",
	USUARIO_RH: "usuario_rh",
} as const;

export const USER_ROLES_DATA: Record<
	(typeof USER_ROLES)[keyof typeof USER_ROLES],
	UserRoleData
> = {
	[USER_ROLES.GERENCIA_RH]: {
		value: USER_ROLES.GERENCIA_RH,
		label: "Gerente RH",
		description: "Acesso de gerenciamento de RH",
		color: "default",
	},
	[USER_ROLES.USUARIO_RH]: {
		value: USER_ROLES.USUARIO_RH,
		label: "Usuário RH",
		description: "Acesso de usuário de RH",
	},
} as const;

export const USER_ROLES_RH = USER_ROLES;
export const USER_ROLES_RH_DATA = USER_ROLES_DATA;
