import { MODULE_STATUS, type ModuleData } from "@/constants";
import { Mail, Target, UserCheck, Users } from "lucide-react";

export const MODULE_ROLES = {
	GERENCIA_CRM: "gerencia_crm",
	USUARIO_CRM: "usuario_crm",
} as const;

export const MODULE_DATA: ModuleData = {
	module: "crm",
	title: "CRM",
	description: "Gestão de clientes e oportunidades",
	url: "/admin/crm",
	color: "bg-blue-500",
	status: MODULE_STATUS.DESENVOLVIMENTO,
	icon: UserCheck,
	moduleRoles: MODULE_ROLES,
	moduleRolesData: {
		[MODULE_ROLES.GERENCIA_CRM]: {
			value: MODULE_ROLES.GERENCIA_CRM,
			label: "Gerente CRM",
			description: "Acesso de gerenciamento de CRM",
			color: "default",
		},
		[MODULE_ROLES.USUARIO_CRM]: {
			value: MODULE_ROLES.USUARIO_CRM,
			label: "Usuário CRM",
			description: "Acesso de usuário de CRM",
		},
	} as const,
	items: [
		{
			title: "Clientes",
			url: "/admin/crm/customers",
			icon: Users,
			status: MODULE_STATUS.DESENVOLVIMENTO,
		},
		{
			title: "Oportunidades",
			url: "/admin/crm/opportunities",
			icon: Target,
			status: MODULE_STATUS.DESENVOLVIMENTO,
		},
		{
			title: "Campanhas",
			url: "/admin/crm/campaigns",
			icon: Mail,
			status: MODULE_STATUS.DESENVOLVIMENTO,
			roles: [MODULE_ROLES.GERENCIA_CRM],
		},
	],
	roles: [MODULE_ROLES.GERENCIA_CRM, MODULE_ROLES.USUARIO_CRM],
} as const;
