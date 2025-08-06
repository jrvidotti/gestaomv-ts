import { MODULE_STATUS, type ModuleData } from "@/constants";
import {
	BarChart3,
	Briefcase,
	Building2,
	Calendar,
	Download,
	Star,
	UserCog,
	Users,
	Users2,
} from "lucide-react";

export const MODULE_ROLES = {
	GERENCIA_RH: "gerencia_rh",
	USUARIO_RH: "usuario_rh",
} as const;

export const MODULE_DATA: ModuleData = {
	module: "rh",
	title: "Recursos Humanos",
	description: "Gestão de funcionários, equipes e avaliações",
	url: "/admin/rh",
	color: "bg-purple-500",
	status: MODULE_STATUS.ATIVO,
	icon: UserCog,
	moduleRoles: MODULE_ROLES,
	moduleRolesData: {
		[MODULE_ROLES.GERENCIA_RH]: {
			value: MODULE_ROLES.GERENCIA_RH,
			label: "Gerente RH",
			description: "Acesso de gerenciamento de RH",
			color: "default",
		},
		[MODULE_ROLES.USUARIO_RH]: {
			value: MODULE_ROLES.USUARIO_RH,
			label: "Usuário RH",
			description: "Acesso de usuário de RH",
		},
	} as const,
	items: [
		{
			title: "Funcionários",
			url: "/admin/rh/funcionarios",
			icon: Users,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.GERENCIA_RH, MODULE_ROLES.USUARIO_RH],
		},
		{
			title: "Equipes",
			url: "/admin/rh/equipes",
			icon: Users2,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.GERENCIA_RH, MODULE_ROLES.USUARIO_RH],
		},
		{
			title: "Departamentos",
			url: "/admin/rh/departamentos",
			icon: Building2,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.GERENCIA_RH],
		},
		{
			title: "Cargos",
			url: "/admin/rh/cargos",
			icon: Briefcase,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.GERENCIA_RH],
		},
		{
			title: "Avaliações de Experiência",
			url: "/admin/rh/avaliacoes-experiencia",
			icon: Star,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.GERENCIA_RH],
		},
		{
			title: "Avaliações Periódicas",
			url: "/admin/rh/avaliacoes-periodicas",
			icon: Calendar,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.GERENCIA_RH],
		},
		{
			title: "Importação PontoWeb",
			url: "/admin/rh/importacao-pontoweb",
			icon: Download,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.GERENCIA_RH],
		},
		{
			title: "Relatórios",
			url: "/admin/rh/relatorios",
			icon: BarChart3,
			status: MODULE_STATUS.DESENVOLVIMENTO,
			roles: [MODULE_ROLES.GERENCIA_RH],
		},
	],
	roles: [MODULE_ROLES.GERENCIA_RH, MODULE_ROLES.USUARIO_RH],
} as const;
