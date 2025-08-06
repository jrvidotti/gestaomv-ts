import { USER_ROLES } from "@/modules/core/enums";
import type { UserRoleType } from "@/modules/core/types";

// User Roles Map with Labels
export interface UserRoleData {
	value: UserRoleType;
	label: string;
	description: string;
	color?: "default" | "secondary" | "destructive" | "outline";
}

export const USER_ROLES_DATA: Record<UserRoleType, UserRoleData> = {
	[USER_ROLES.SUPERADMIN]: {
		value: USER_ROLES.SUPERADMIN,
		label: "Superadmin",
		description: "Acesso total ao sistema (superusuário)",
		color: "destructive",
	},
	[USER_ROLES.ADMIN]: {
		value: USER_ROLES.ADMIN,
		label: "Administrador",
		description: "Acesso total ao sistema",
		color: "destructive",
	},
	[USER_ROLES.GERENCIA_RH]: {
		value: USER_ROLES.GERENCIA_RH,
		label: "Gerente RH",
		description: "Acesso de gerenciamento de RH",
		color: "default",
	},
	[USER_ROLES.GERENCIA_RMA]: {
		value: USER_ROLES.GERENCIA_RMA,
		label: "Gerente RMA",
		description: "Acesso de gerenciamento de RMA",
		color: "default",
	},
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
	[USER_ROLES.GERENCIA_FINANCEIRO]: {
		value: USER_ROLES.GERENCIA_FINANCEIRO,
		label: "Gerente Financeiro",
		description: "Acesso de gerenciamento de Financeiro",
		color: "default",
	},
	[USER_ROLES.GERENCIA_CRM]: {
		value: USER_ROLES.GERENCIA_CRM,
		label: "Gerente CRM",
		description: "Acesso de gerenciamento de CRM",
		color: "default",
	},
	[USER_ROLES.AVALIADOR_CHECKLIST]: {
		value: USER_ROLES.AVALIADOR_CHECKLIST,
		label: "Avaliador Checklist",
		description:
			"Responsável por avaliar unidades através de checklists periódicos",
		color: "secondary",
	},
	[USER_ROLES.USUARIO_RH]: {
		value: USER_ROLES.USUARIO_RH,
		label: "Usuário RH",
		description: "Acesso de usuário de RH",
	},
	[USER_ROLES.USUARIO_RMA]: {
		value: USER_ROLES.USUARIO_RMA,
		label: "Usuário RMA",
		description: "Acesso de usuário de RMA",
	},
	[USER_ROLES.USUARIO_ALMOXARIFADO]: {
		value: USER_ROLES.USUARIO_ALMOXARIFADO,
		label: "Usuário Almoxarifado",
		description:
			"Criação e acompanhamento de solicitações próprias, cancelamento de pendentes",
	},
	[USER_ROLES.USUARIO_FINANCEIRO]: {
		value: USER_ROLES.USUARIO_FINANCEIRO,
		label: "Usuário Financeiro",
		description: "Acesso de usuário de Financeiro",
	},
	[USER_ROLES.USUARIO_CRM]: {
		value: USER_ROLES.USUARIO_CRM,
		label: "Usuário CRM",
		description: "Acesso de usuário de CRM",
	},
} as const;

// Utility functions
export const getUserRoleLabel = (role: UserRoleType): string => {
	return USER_ROLES_DATA[role]?.label || role;
};
