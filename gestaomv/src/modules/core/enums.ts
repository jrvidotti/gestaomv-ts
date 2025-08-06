// User Roles Constants
export const USER_ROLES = {
	SUPERADMIN: "superadmin",
	ADMIN: "admin",
	GERENCIA_RH: "gerencia_rh",
	GERENCIA_RMA: "gerencia_rma",
	GERENCIA_ALMOXARIFADO: "gerencia_almoxarifado",
	APROVADOR_ALMOXARIFADO: "aprovador_almoxarifado",
	GERENCIA_FINANCEIRO: "gerencia_financeiro",
	GERENCIA_CRM: "gerencia_crm",
	AVALIADOR_CHECKLIST: "avaliador_checklist",
	USUARIO_RH: "usuario_rh",
	USUARIO_RMA: "usuario_rma",
	USUARIO_ALMOXARIFADO: "usuario_almoxarifado",
	USUARIO_FINANCEIRO: "usuario_financeiro",
	USUARIO_CRM: "usuario_crm",
} as const;

export const USER_ROLES_ARRAY = Object.values(USER_ROLES) as [
	string,
	...string[],
];

export const roleLabels = {
	admin: "Administrador",
	manager: "Gerente",
	user: "Usuário",
};
