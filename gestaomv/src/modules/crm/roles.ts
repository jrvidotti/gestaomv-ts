import type { UserRoleData } from "@/constants";

const USER_ROLES = {
	GERENCIA_CRM: "gerencia_crm",
	USUARIO_CRM: "usuario_crm",
} as const;

export const USER_ROLES_DATA: Record<
	(typeof USER_ROLES)[keyof typeof USER_ROLES],
	UserRoleData
> = {
	[USER_ROLES.GERENCIA_CRM]: {
		value: USER_ROLES.GERENCIA_CRM,
		label: "Gerente CRM",
		description: "Acesso de gerenciamento de CRM",
		color: "default",
	},
	[USER_ROLES.USUARIO_CRM]: {
		value: USER_ROLES.USUARIO_CRM,
		label: "Usuário CRM",
		description: "Acesso de usuário de CRM",
	},
} as const;

export const USER_ROLES_CRM = USER_ROLES;
export const USER_ROLES_CRM_DATA = USER_ROLES_DATA;
