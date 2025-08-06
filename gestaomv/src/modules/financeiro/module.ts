import { MODULE_STATUS, type ModuleData } from "@/constants";
import { USER_ROLES } from "@/constants";
import { CreditCard, DollarSign, Receipt, TrendingUp } from "lucide-react";

export const MODULE_DATA_FINANCEIRO: ModuleData = {
	module: "financeiro",
	title: "Financeiro",
	description: "Contas a pagar, receber e fluxo de caixa",
	url: "/admin/financeiro",
	color: "bg-green-500",
	status: MODULE_STATUS.DESENVOLVIMENTO,
	icon: DollarSign,
	items: [
		{
			title: "Contas a Pagar",
			url: "/admin/financeiro/payable",
			icon: CreditCard,
			status: MODULE_STATUS.DESENVOLVIMENTO,
		},
		{
			title: "Contas a Receber",
			url: "/admin/financeiro/receivable",
			icon: Receipt,
			status: MODULE_STATUS.DESENVOLVIMENTO,
		},
		{
			title: "Fluxo de Caixa",
			url: "/admin/financeiro/cashflow",
			icon: TrendingUp,
			status: MODULE_STATUS.DESENVOLVIMENTO,
			roles: [USER_ROLES.GERENCIA_FINANCEIRO],
		},
	],
	roles: [USER_ROLES.GERENCIA_FINANCEIRO, USER_ROLES.USUARIO_FINANCEIRO],
} as const;
