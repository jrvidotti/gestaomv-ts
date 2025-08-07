import { MODULE_STATUS, type ModuleData } from "@/constants";
import { Mail, Target, UserCheck, Users } from "lucide-react";

export const MODULE_ROLES = {
	CRM_GERENCIA: "crm_gerencia",
	CRM_USUARIO: "crm_usuario",
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
		[MODULE_ROLES.CRM_GERENCIA]: {
			value: MODULE_ROLES.CRM_GERENCIA,
			label: "Gerente CRM",
			description: "Acesso de gerenciamento de CRM",
			color: "default",
		},
		[MODULE_ROLES.CRM_USUARIO]: {
			value: MODULE_ROLES.CRM_USUARIO,
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
			roles: [MODULE_ROLES.CRM_GERENCIA],
		},
	],
	roles: [MODULE_ROLES.CRM_GERENCIA, MODULE_ROLES.CRM_USUARIO],
} as const;
