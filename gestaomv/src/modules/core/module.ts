import { MODULE_STATUS, type ModuleData } from "@/constants";
import { USER_ROLES } from "@/constants";
import { Building, Building2, Settings, Users } from "lucide-react";

export const MODULE_DATA_CORE: ModuleData = {
	module: "core",
	title: "Administração",
	description: "Configurações e usuários do sistema",
	url: "/admin/core",
	color: "bg-slate-500",
	status: MODULE_STATUS.ATIVO,
	icon: Settings,
	items: [
		{
			title: "Usuários",
			url: "/admin/core/users",
			icon: Users,
			status: MODULE_STATUS.ATIVO,
		},
		{
			title: "Empresas",
			url: "/admin/core/empresas",
			icon: Building,
			status: MODULE_STATUS.ATIVO,
		},
		{
			title: "Unidades",
			url: "/admin/core/unidades",
			icon: Building2,
			status: MODULE_STATUS.ATIVO,
		},
		{
			title: "Configurações",
			url: "/admin/core/configuracoes",
			icon: Settings,
			status: MODULE_STATUS.DESENVOLVIMENTO,
		},
	],
	roles: [USER_ROLES.ADMIN],
} as const;
