import { MODULE_STATUS, type ModuleData } from "@/constants";
import { ClipboardList, FileText, Package, PackageOpen } from "lucide-react";

// Map dos roles do módulo
export const MODULE_ROLES = {
	GERENCIA_ALMOXARIFADO: "gerencia_almoxarifado",
	APROVADOR_ALMOXARIFADO: "aprovador_almoxarifado",
	USUARIO_ALMOXARIFADO: "usuario_almoxarifado",
} as const;

// Map dos dados do módulo
export const MODULE_DATA: ModuleData = {
	module: "almoxarifado",
	moduleRoles: MODULE_ROLES,
	moduleRolesData: {
		[MODULE_ROLES.GERENCIA_ALMOXARIFADO]: {
			value: MODULE_ROLES.GERENCIA_ALMOXARIFADO,
			label: "Gerente Almoxarifado",
			description:
				"Atendimento de solicitações e ajuste controlado de quantidades (apenas redução)",
			color: "default",
		},
		[MODULE_ROLES.APROVADOR_ALMOXARIFADO]: {
			value: MODULE_ROLES.APROVADOR_ALMOXARIFADO,
			label: "Aprovador Almoxarifado",
			description:
				"Aprovação/rejeição e atendimento de solicitações com controle total de quantidades",
			color: "secondary",
		},
		[MODULE_ROLES.USUARIO_ALMOXARIFADO]: {
			value: MODULE_ROLES.USUARIO_ALMOXARIFADO,
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
				MODULE_ROLES.GERENCIA_ALMOXARIFADO,
				MODULE_ROLES.USUARIO_ALMOXARIFADO,
			],
		},
		{
			title: "Solicitações",
			url: "/admin/almoxarifado/solicitacoes",
			icon: ClipboardList,
			status: MODULE_STATUS.ATIVO,
			roles: [
				MODULE_ROLES.GERENCIA_ALMOXARIFADO,
				MODULE_ROLES.USUARIO_ALMOXARIFADO,
			],
		},
		{
			title: "Relatórios",
			url: "/admin/almoxarifado/relatorios",
			icon: FileText,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.GERENCIA_ALMOXARIFADO],
		},
	],
	roles: [
		MODULE_ROLES.GERENCIA_ALMOXARIFADO,
		MODULE_ROLES.USUARIO_ALMOXARIFADO,
	],
} as const;
