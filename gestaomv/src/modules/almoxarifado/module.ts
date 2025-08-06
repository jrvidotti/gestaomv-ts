import { MODULE_STATUS, type ModuleData } from "@/constants";
import { USER_ROLES } from "@/constants";
import { ClipboardList, FileText, Package, PackageOpen } from "lucide-react";

export const MODULE_DATA_ALMOXARIFADO: ModuleData = {
	module: "almoxarifado",
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
				USER_ROLES.GERENCIA_ALMOXARIFADO,
				USER_ROLES.USUARIO_ALMOXARIFADO,
			],
		},
		{
			title: "Solicitações",
			url: "/admin/almoxarifado/solicitacoes",
			icon: ClipboardList,
			status: MODULE_STATUS.ATIVO,
			roles: [
				USER_ROLES.GERENCIA_ALMOXARIFADO,
				USER_ROLES.USUARIO_ALMOXARIFADO,
			],
		},
		{
			title: "Relatórios",
			url: "/admin/almoxarifado/relatorios",
			icon: FileText,
			status: MODULE_STATUS.ATIVO,
			roles: [USER_ROLES.GERENCIA_ALMOXARIFADO],
		},
	],
	roles: [USER_ROLES.GERENCIA_ALMOXARIFADO, USER_ROLES.USUARIO_ALMOXARIFADO],
} as const;
