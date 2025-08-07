import type { ModuleData } from "@/constants";
import { MODULE_STATUS } from "@/constants/modules-status";
import { BarChart3, CheckSquare, ClipboardList } from "lucide-react";

export const MODULE_ROLES = {
	CHECKLIST_GESTOR: "checklist_gestor",
	CHECKLIST_AVALIADOR: "checklist_avaliador",
} as const;

export const MODULE_DATA: ModuleData = {
	module: "checklist",
	title: "Checklist",
	description: "Avaliações periódicas de unidades",
	url: "/admin/checklist",
	color: "bg-indigo-500",
	status: MODULE_STATUS.ATIVO,
	icon: CheckSquare,
	moduleRoles: MODULE_ROLES,
	moduleRolesData: {
		[MODULE_ROLES.CHECKLIST_AVALIADOR]: {
			value: MODULE_ROLES.CHECKLIST_AVALIADOR,
			label: "Avaliador Checklist",
			description:
				"Responsável por avaliar unidades através de checklists periódicos",
			color: "secondary",
		},
	} as const,
	items: [
		{
			title: "Templates",
			url: "/admin/checklist/templates",
			icon: ClipboardList,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.CHECKLIST_GESTOR],
		},
		{
			title: "Avaliações",
			url: "/admin/checklist/avaliacoes",
			icon: CheckSquare,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.CHECKLIST_GESTOR, MODULE_ROLES.CHECKLIST_AVALIADOR],
		},
		{
			title: "Relatórios",
			url: "/admin/checklist/relatorios",
			icon: BarChart3,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.CHECKLIST_GESTOR, MODULE_ROLES.CHECKLIST_AVALIADOR],
		},
	],
	roles: [MODULE_ROLES.CHECKLIST_GESTOR, MODULE_ROLES.CHECKLIST_AVALIADOR],
} as const;
