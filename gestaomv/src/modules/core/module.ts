import { MODULE_STATUS, type ModuleData } from "@/constants";
import { Building, Building2, Settings, Users } from "lucide-react";

export const MODULE_ROLES = {
	SUPERADMIN: "superadmin",
	ADMIN: "admin",
} as const;

export const MODULE_DATA: ModuleData = {
	module: "core",
	title: "Administração",
	description: "Configurações e usuários do sistema",
	url: "/admin/core",
	color: "bg-slate-500",
	status: MODULE_STATUS.ATIVO,
	icon: Settings,
	moduleRoles: MODULE_ROLES,
	moduleRolesData: {
		[MODULE_ROLES.SUPERADMIN]: {
			value: MODULE_ROLES.SUPERADMIN,
			label: "Superadmin",
			description: "Acesso total ao sistema (superusuário)",
			color: "destructive",
		},
		[MODULE_ROLES.ADMIN]: {
			value: MODULE_ROLES.ADMIN,
			label: "Administrador",
			description: "Acesso total ao sistema",
			color: "destructive",
		},
	} as const,
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
	roles: [MODULE_ROLES.SUPERADMIN, MODULE_ROLES.ADMIN],
} as const;
