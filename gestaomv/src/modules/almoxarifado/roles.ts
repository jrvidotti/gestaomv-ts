import type { UserRoleData } from "@/constants";

const USER_ROLES = {
	GERENCIA_ALMOXARIFADO: "gerencia_almoxarifado",
	APROVADOR_ALMOXARIFADO: "aprovador_almoxarifado",
	USUARIO_ALMOXARIFADO: "usuario_almoxarifado",
} as const;

export const USER_ROLES_DATA: Record<
	(typeof USER_ROLES)[keyof typeof USER_ROLES],
	UserRoleData
> = {
	[USER_ROLES.GERENCIA_ALMOXARIFADO]: {
		value: USER_ROLES.GERENCIA_ALMOXARIFADO,
		label: "Gerente Almoxarifado",
		description:
			"Atendimento de solicitações e ajuste controlado de quantidades (apenas redução)",
		color: "default",
	},
	[USER_ROLES.APROVADOR_ALMOXARIFADO]: {
		value: USER_ROLES.APROVADOR_ALMOXARIFADO,
		label: "Aprovador Almoxarifado",
		description:
			"Aprovação/rejeição e atendimento de solicitações com controle total de quantidades",
		color: "secondary",
	},
	[USER_ROLES.USUARIO_ALMOXARIFADO]: {
		value: USER_ROLES.USUARIO_ALMOXARIFADO,
		label: "Usuário Almoxarifado",
		description:
			"Criação e acompanhamento de solicitações próprias, cancelamento de pendentes",
	},
} as const;

export const USER_ROLES_ALMOXARIFADO = USER_ROLES;
export const USER_ROLES_ALMOXARIFADO_DATA = USER_ROLES_DATA;
