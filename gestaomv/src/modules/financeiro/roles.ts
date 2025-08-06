import type { UserRoleData } from "@/constants";

const USER_ROLES = {
	GERENCIA_FINANCEIRO: "gerencia_financeiro",
	USUARIO_FINANCEIRO: "usuario_financeiro",
} as const;

export const USER_ROLES_DATA: Record<
	(typeof USER_ROLES)[keyof typeof USER_ROLES],
	UserRoleData
> = {
	[USER_ROLES.GERENCIA_FINANCEIRO]: {
		value: USER_ROLES.GERENCIA_FINANCEIRO,
		label: "Gerente Financeiro",
		description: "Acesso de gerenciamento de Financeiro",
		color: "default",
	},
	[USER_ROLES.USUARIO_FINANCEIRO]: {
		value: USER_ROLES.USUARIO_FINANCEIRO,
		label: "Usuário Financeiro",
		description: "Acesso de usuário de Financeiro",
	},
} as const;

export const USER_ROLES_FINANCEIRO = USER_ROLES;
export const USER_ROLES_FINANCEIRO_DATA = USER_ROLES_DATA;
