import type { UserRoleType } from "@/constants";
import { MODULE_DATA_ALMOXARIFADO } from "@/modules/almoxarifado/module";
import { MODULE_DATA_CHECKLIST } from "@/modules/checklist/module";
import { MODULE_DATA_CORE } from "@/modules/core/module";
import { MODULE_DATA_CRM } from "@/modules/crm/module";
import { MODULE_DATA_FINANCEIRO } from "@/modules/financeiro/module";
import { MODULE_DATA_RH } from "@/modules/rh/module";
import { MODULE_DATA_RMA } from "@/modules/rma/module";
import type { ModuleStatus } from "./modules-status";

export interface ModuleItem {
	title: string;
	description?: string;
	url: string;
	icon: React.ElementType;
	status?: ModuleStatus;
	roles?: readonly UserRoleType[];
}

export interface ModuleData<T extends string = string> extends ModuleItem {
	module: T;
	color: string;
	items?: readonly ModuleItem[];
}

/**
 * Dados dos módulos
 * @roles: Roles do usuário que podem acessar o módulo (admin pode acessar tudo)
 * @status: Status do módulo (ativo, desenvolvimento, desabilitado)
 * @items: Itens do módulo
 *   @roles: Roles do usuário que podem acessar o item (caso não seja informado, o atributo é herdado do módulo)
 */
export const MODULES_DATA = [
	MODULE_DATA_CORE,
	MODULE_DATA_RH,
	MODULE_DATA_ALMOXARIFADO,
	MODULE_DATA_CHECKLIST,
	MODULE_DATA_FINANCEIRO,
	MODULE_DATA_RMA,
	MODULE_DATA_CRM,
] as const;

export const MODULE = {
	CORE: "core",
	RH: "rh",
	ALMOXARIFADO: "almoxarifado",
	CHECKLIST: "checklist",
	FINANCEIRO: "financeiro",
	RMA: "rma",
	CRM: "crm",
} as const;

// Tipo inferido a partir de MODULE
export type ModuleType = (typeof MODULE)[keyof typeof MODULE];

// Array com os nomes dos módulos
export const MODULES = Object.values(MODULE);
