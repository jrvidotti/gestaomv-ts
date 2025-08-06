import type { ModuleData } from "@/constants";
import { USER_ROLES } from "@/constants";
import { MODULE_STATUS } from "@/constants/modules-status";
import { BarChart3, CheckSquare, ClipboardList } from "lucide-react";

// Configuração do módulo para o menu
export const MODULE_DATA_CHECKLIST: ModuleData = {
	module: "checklist",
	title: "Checklist",
	description: "Avaliações periódicas de unidades",
	url: "/admin/checklist",
	color: "bg-indigo-500",
	status: MODULE_STATUS.ATIVO,
	icon: CheckSquare,
	items: [
		{
			title: "Templates",
			url: "/admin/checklist/templates",
			icon: ClipboardList,
			status: MODULE_STATUS.ATIVO,
			roles: [USER_ROLES.ADMIN],
		},
		{
			title: "Avaliações",
			url: "/admin/checklist/avaliacoes",
			icon: CheckSquare,
			status: MODULE_STATUS.ATIVO,
			roles: [USER_ROLES.AVALIADOR_CHECKLIST],
		},
		{
			title: "Relatórios",
			url: "/admin/checklist/relatorios",
			icon: BarChart3,
			status: MODULE_STATUS.ATIVO,
			roles: [USER_ROLES.AVALIADOR_CHECKLIST],
		},
	],
	roles: [USER_ROLES.ADMIN, USER_ROLES.AVALIADOR_CHECKLIST],
} as const;
