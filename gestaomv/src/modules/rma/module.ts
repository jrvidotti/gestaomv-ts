import { MODULE_STATUS, type ModuleData } from "@/constants";
import { USER_ROLES } from "@/constants";
import { CheckCircle, Clock, History, RotateCcw } from "lucide-react";

export const MODULE_DATA_RMA: ModuleData = {
	module: "rma",
	title: "RMA",
	description: "Solicitações e processamento de devoluções",
	url: "/admin/rma",
	color: "bg-orange-500",
	status: MODULE_STATUS.DESENVOLVIMENTO,
	icon: RotateCcw,
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
			roles: [USER_ROLES.GERENCIA_RMA],
		},
		{
			title: "Histórico",
			url: "/admin/rma/history",
			icon: History,
			status: MODULE_STATUS.DESENVOLVIMENTO,
			roles: [USER_ROLES.GERENCIA_RMA],
		},
	],
	roles: [USER_ROLES.GERENCIA_RMA, USER_ROLES.USUARIO_RMA],
} as const;
