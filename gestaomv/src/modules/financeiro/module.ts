import { MODULE_STATUS, type ModuleData } from "@/constants";
import { CreditCard, DollarSign, Receipt, TrendingUp } from "lucide-react";

export const MODULE_ROLES = {
	GERENCIA_FINANCEIRO: "gerencia_financeiro",
	USUARIO_FINANCEIRO: "usuario_financeiro",
} as const;

export const MODULE_DATA: ModuleData = {
	module: "financeiro",
	title: "Financeiro",
	description: "Contas a pagar, receber e fluxo de caixa",
	url: "/admin/financeiro",
	color: "bg-green-500",
	status: MODULE_STATUS.DESENVOLVIMENTO,
	icon: DollarSign,
	moduleRoles: MODULE_ROLES,
	moduleRolesData: {
		[MODULE_ROLES.GERENCIA_FINANCEIRO]: {
			value: MODULE_ROLES.GERENCIA_FINANCEIRO,
			label: "Gerente Financeiro",
			description: "Acesso de gerenciamento de Financeiro",
			color: "default",
		},
		[MODULE_ROLES.USUARIO_FINANCEIRO]: {
			value: MODULE_ROLES.USUARIO_FINANCEIRO,
			label: "Usuário Financeiro",
			description: "Acesso de usuário de Financeiro",
		},
	} as const,
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
			roles: [MODULE_ROLES.GERENCIA_FINANCEIRO],
		},
	],
	roles: [MODULE_ROLES.GERENCIA_FINANCEIRO, MODULE_ROLES.USUARIO_FINANCEIRO],
} as const;
