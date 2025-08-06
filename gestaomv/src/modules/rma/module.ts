import { MODULE_STATUS, type ModuleData } from "@/constants";
import { CheckCircle, Clock, History, RotateCcw } from "lucide-react";

export const MODULE_ROLES = {
	GERENCIA_RMA: "gerencia_rma",
	USUARIO_RMA: "usuario_rma",
} as const;

export const MODULE_DATA: ModuleData = {
	module: "rma",
	title: "RMA",
	description: "Solicitações e processamento de devoluções",
	url: "/admin/rma",
	color: "bg-orange-500",
	status: MODULE_STATUS.DESENVOLVIMENTO,
	icon: RotateCcw,
	moduleRoles: MODULE_ROLES,
	moduleRolesData: {
		[MODULE_ROLES.GERENCIA_RMA]: {
			value: MODULE_ROLES.GERENCIA_RMA,
			label: "Gerente RMA",
			description: "Acesso de gerenciamento de RMA",
			color: "default",
		},
		[MODULE_ROLES.USUARIO_RMA]: {
			value: MODULE_ROLES.USUARIO_RMA,
			label: "Usuário RMA",
			description: "Acesso de usuário de RMA",
		},
	} as const,
	items: [
		{
			title: "Solicitações",
			url: "/admin/rma/requests",
			icon: Clock,
			status: MODULE_STATUS.DESENVOLVIMENTO,
		},
		{
			title: "Processamento",
			url: "/admin/rma/processing",
			icon: CheckCircle,
			status: MODULE_STATUS.DESENVOLVIMENTO,
			roles: [MODULE_ROLES.GERENCIA_RMA],
		},
		{
			title: "Histórico",
			url: "/admin/rma/history",
			icon: History,
			status: MODULE_STATUS.DESENVOLVIMENTO,
			roles: [MODULE_ROLES.GERENCIA_RMA],
		},
	],
	roles: [MODULE_ROLES.GERENCIA_RMA, MODULE_ROLES.USUARIO_RMA],
} as const;
