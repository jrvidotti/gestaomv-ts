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
	RH_GERENCIA: "rh_gerencia",
	RH_USUARIO: "rh_usuario",
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
		[MODULE_ROLES.RH_GERENCIA]: {
			value: MODULE_ROLES.RH_GERENCIA,
			label: "Gerente RH",
			description: "Acesso de gerenciamento de RH",
			color: "default",
		},
		[MODULE_ROLES.RH_USUARIO]: {
			value: MODULE_ROLES.RH_USUARIO,
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
			roles: [MODULE_ROLES.RH_GERENCIA, MODULE_ROLES.RH_USUARIO],
		},
		{
			title: "Equipes",
			url: "/admin/rh/equipes",
			icon: Users2,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.RH_GERENCIA, MODULE_ROLES.RH_USUARIO],
		},
		{
			title: "Departamentos",
			url: "/admin/rh/departamentos",
			icon: Building2,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.RH_GERENCIA],
		},
		{
			title: "Cargos",
			url: "/admin/rh/cargos",
			icon: Briefcase,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.RH_GERENCIA],
		},
		{
			title: "Avaliações de Experiência",
			url: "/admin/rh/avaliacoes-experiencia",
			icon: Star,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.RH_GERENCIA],
		},
		{
			title: "Avaliações Periódicas",
			url: "/admin/rh/avaliacoes-periodicas",
			icon: Calendar,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.RH_GERENCIA],
		},
		{
			title: "Importação PontoWeb",
			url: "/admin/rh/importacao-pontoweb",
			icon: Download,
			status: MODULE_STATUS.ATIVO,
			roles: [MODULE_ROLES.RH_GERENCIA],
		},
		{
			title: "Relatórios",
			url: "/admin/rh/relatorios",
			icon: BarChart3,
			status: MODULE_STATUS.DESENVOLVIMENTO,
			roles: [MODULE_ROLES.RH_GERENCIA],
		},
	],
	roles: [MODULE_ROLES.RH_GERENCIA, MODULE_ROLES.RH_USUARIO],
} as const;
