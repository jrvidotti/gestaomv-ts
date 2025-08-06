import { MODULE_STATUS, type ModuleData } from "@/constants";
import { USER_ROLES } from "@/constants";
import { Mail, Target, UserCheck, Users } from "lucide-react";

export const MODULE_DATA_CRM: ModuleData = {
	module: "crm",
	title: "CRM",
	description: "Gestão de clientes e oportunidades",
	url: "/admin/crm",
	color: "bg-blue-500",
	status: MODULE_STATUS.DESENVOLVIMENTO,
	icon: UserCheck,
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
			roles: [USER_ROLES.GERENCIA_CRM],
		},
	],
	roles: [USER_ROLES.GERENCIA_CRM, USER_ROLES.USUARIO_CRM],
} as const;
