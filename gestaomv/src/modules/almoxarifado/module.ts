import { MODULE_STATUS, type ModuleData } from "@/constants";
import { ClipboardList, FileText, Package, PackageOpen } from "lucide-react";

// Map dos roles do módulo
export const MODULE_ROLES = {
	ALMOXARIFADO_GERENCIA: "almoxarifado_gerencia",
	ALMOXARIFADO_APROVADOR: "almoxarifado_aprovador",
	ALMOXARIFADO_USUARIO: "almoxarifado_usuario",
} as const;

// Map dos dados do módulo
export const MODULE_DATA: ModuleData = {
	module: "almoxarifado",
	moduleRoles: MODULE_ROLES,
	moduleRolesData: {
		[MODULE_ROLES.ALMOXARIFADO_GERENCIA]: {
			value: MODULE_ROLES.ALMOXARIFADO_GERENCIA,
			label: "Gerente Almoxarifado",
			description:
				"Atendimento de solicitações e ajuste controlado de quantidades (apenas redução)",
			color: "default",
		},
		[MODULE_ROLES.ALMOXARIFADO_APROVADOR]: {
			value: MODULE_ROLES.ALMOXARIFADO_APROVADOR,
			label: "Aprovador Almoxarifado",
			description:
				"Aprovação/rejeição e atendimento de solicitações com controle total de quantidades",
			color: "secondary",
		},
		[MODULE_ROLES.ALMOXARIFADO_USUARIO]: {
			value: MODULE_ROLES.ALMOXARIFADO_USUARIO,
			label: "Usuário Almoxarifado",
			description:
				"Criação e acompanhamento de solicitações próprias, cancelamento de pendentes",
		},
	},
	title: "Almoxarifado",
	description: "Gestão de materiais e solicitações",
	url: "/admin/almoxarifado",
	color: "bg-emerald-500",
	status: MODULE_STATUS.ATIVO,
	icon: Package,
	items: [
		{
			title: "Materiais",
			url: "/admin/almoxarifado/materiais",
			icon: PackageOpen,
			status: MODULE_STATUS.ATIVO,
			roles: [
				MODULE_ROLES.ALMOXARIFADO_GERENCIA,
				MODULE_ROLES.ALMOXARIFADO_APROVADOR,
			],
		},
		{
			title: "Solicitações",
			url: "/admin/almoxarifado/solicitacoes",
			icon: ClipboardList,
			status: MODULE_STATUS.ATIVO,
			roles: [
				MODULE_ROLES.ALMOXARIFADO_GERENCIA,
				MODULE_ROLES.ALMOXARIFADO_APROVADOR,
				MODULE_ROLES.ALMOXARIFADO_USUARIO,
			],
		},
		{
			title: "Relatórios",
			url: "/admin/almoxarifado/relatorios",
			icon: FileText,
			status: MODULE_STATUS.ATIVO,
			roles: [
				MODULE_ROLES.ALMOXARIFADO_GERENCIA,
				MODULE_ROLES.ALMOXARIFADO_APROVADOR,
			],
		},
	],
	roles: [
		MODULE_ROLES.ALMOXARIFADO_GERENCIA,
		MODULE_ROLES.ALMOXARIFADO_APROVADOR,
		MODULE_ROLES.ALMOXARIFADO_USUARIO,
	],
} as const;
