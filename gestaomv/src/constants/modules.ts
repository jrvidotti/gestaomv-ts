import { USER_ROLES } from "@/modules/core/enums";
import type { UserRoleType } from "@/modules/core/types";
import {
	BarChart3,
	Briefcase,
	Building,
	Building2,
	Calendar,
	CheckCircle,
	CheckSquare,
	ClipboardList,
	Clock,
	CreditCard,
	DollarSign,
	Download,
	FileText,
	History,
	Mail,
	Package,
	PackageOpen,
	Receipt,
	RotateCcw,
	Settings,
	Star,
	Target,
	TrendingUp,
	UserCheck,
	UserCog,
	Users,
	Users2,
} from "lucide-react";
import { MODULE_STATUS, type ModuleStatus } from "./modules-status";

// System Modules Constants
export const MODULES = {
	CORE: "core",
	RH: "rh",
	ALMOXARIFADO: "almoxarifado",
	CHECKLIST: "checklist",
	FINANCEIRO: "financeiro",
	RMA: "rma",
	CRM: "crm",
} as const;

export type ModuleType = (typeof MODULES)[keyof typeof MODULES];

export const MODULES_ARRAY = Object.values(MODULES) as [string, ...string[]];

export interface ModuleItem {
	title: string;
	description?: string;
	url: string;
	icon: React.ElementType;
	status?: ModuleStatus;
	roles?: UserRoleType[];
}

export interface ModuleData extends ModuleItem {
	module: ModuleType;
	color: string;
	items?: ModuleItem[];
}

/**
 * Dados dos módulos
 * @roles: Roles do usuário que podem acessar o módulo (admin pode acessar tudo)
 * @status: Status do módulo (ativo, desenvolvimento, desabilitado)
 * @items: Itens do módulo
 *   @roles: Roles do usuário que podem acessar o item (caso não seja informado, o atributo é herdado do módulo)
 */
export const MODULES_DATA: ModuleData[] = [
	{
		module: MODULES.CORE,
		title: "Administração",
		description: "Configurações e usuários do sistema",
		url: "/admin/core",
		color: "bg-slate-500",
		status: MODULE_STATUS.ATIVO,
		icon: Settings,
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
		roles: [USER_ROLES.ADMIN],
	},
	{
		module: MODULES.RH,
		title: "Recursos Humanos",
		description: "Gestão de funcionários, equipes e avaliações",
		url: "/admin/rh",
		color: "bg-purple-500",
		status: MODULE_STATUS.ATIVO,
		icon: UserCog,
		items: [
			{
				title: "Funcionários",
				url: "/admin/rh/funcionarios",
				icon: Users,
				status: MODULE_STATUS.ATIVO,
				roles: [USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH],
			},
			{
				title: "Equipes",
				url: "/admin/rh/equipes",
				icon: Users2,
				status: MODULE_STATUS.ATIVO,
				roles: [USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH],
			},
			{
				title: "Departamentos",
				url: "/admin/rh/departamentos",
				icon: Building2,
				status: MODULE_STATUS.ATIVO,
				roles: [USER_ROLES.GERENCIA_RH],
			},
			{
				title: "Cargos",
				url: "/admin/rh/cargos",
				icon: Briefcase,
				status: MODULE_STATUS.ATIVO,
				roles: [USER_ROLES.GERENCIA_RH],
			},
			{
				title: "Avaliações de Experiência",
				url: "/admin/rh/avaliacoes-experiencia",
				icon: Star,
				status: MODULE_STATUS.ATIVO,
				roles: [USER_ROLES.GERENCIA_RH],
			},
			{
				title: "Avaliações Periódicas",
				url: "/admin/rh/avaliacoes-periodicas",
				icon: Calendar,
				status: MODULE_STATUS.ATIVO,
				roles: [USER_ROLES.GERENCIA_RH],
			},
			{
				title: "Importação PontoWeb",
				url: "/admin/rh/importacao-pontoweb",
				icon: Download,
				status: MODULE_STATUS.ATIVO,
				roles: [USER_ROLES.GERENCIA_RH],
			},
			{
				title: "Relatórios",
				url: "/admin/rh/relatorios",
				icon: BarChart3,
				status: MODULE_STATUS.DESENVOLVIMENTO,
				roles: [USER_ROLES.GERENCIA_RH],
			},
		],
		roles: [USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH],
	},
	{
		module: MODULES.ALMOXARIFADO,
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
	},
	{
		module: MODULES.CHECKLIST,
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
	},
	{
		module: MODULES.FINANCEIRO,
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
	},
	{
		module: MODULES.RMA,
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
	},
	{
		module: MODULES.CRM,
		title: "CRM",
		description: "Gestão de clientes e oportunidades",
		url: "/admin/crm",
		color: "bg-blue-500",
		status: MODULE_STATUS.DESENVOLVIMENTO,
		icon: UserCheck,
		items: [
			{
				title: "Clientes",
				url: "/admin/crm/customers",
				icon: Users,
				status: MODULE_STATUS.DESENVOLVIMENTO,
			},
			{
				title: "Oportunidades",
				url: "/admin/crm/opportunities",
				icon: Target,
				status: MODULE_STATUS.DESENVOLVIMENTO,
			},
			{
				title: "Campanhas",
				url: "/admin/crm/campaigns",
				icon: Mail,
				status: MODULE_STATUS.DESENVOLVIMENTO,
				roles: [USER_ROLES.GERENCIA_CRM],
			},
		],
		roles: [USER_ROLES.GERENCIA_CRM, USER_ROLES.USUARIO_CRM],
	},
];
