import * as ALMOXARIFADO from "@/modules/almoxarifado/module";
import * as CHECKLIST from "@/modules/checklist/module";
import * as CORE from "@/modules/core/module";
import * as CRM from "@/modules/crm/module";
import * as FINANCEIRO from "@/modules/financeiro/module";
import * as RH from "@/modules/rh/module";
import * as RMA from "@/modules/rma/module";
import type { ModuleStatus } from "./modules-status";

/**
 * Dados dos módulos
 * @roles: Roles do usuário que podem acessar o módulo (admin pode acessar tudo)
 * @status: Status do módulo (ativo, desenvolvimento, desabilitado)
 * @items: Itens do módulo
 *   @roles: Roles do usuário que podem acessar o item (caso não seja informado, o atributo é herdado do módulo)
 */
export const MODULES_DATA = [
	CORE.MODULE_DATA,
	RH.MODULE_DATA,
	ALMOXARIFADO.MODULE_DATA,
	CHECKLIST.MODULE_DATA,
	FINANCEIRO.MODULE_DATA,
	RMA.MODULE_DATA,
	CRM.MODULE_DATA,
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

export type ModuleType = (typeof MODULE)[keyof typeof MODULE];

export const MODULES = Object.values(MODULE);

export const ALL_ROLES = {
	...CORE.MODULE_ROLES,
	...RH.MODULE_ROLES,
	...ALMOXARIFADO.MODULE_ROLES,
	...CHECKLIST.MODULE_ROLES,
	...RMA.MODULE_ROLES,
	...CRM.MODULE_ROLES,
	...FINANCEIRO.MODULE_ROLES,
} as const;

export type UserRoleType = (typeof ALL_ROLES)[keyof typeof ALL_ROLES];

export const USER_ROLES_ARRAY = Object.values(ALL_ROLES);

export const ALL_ROLES_DATA = {
	...CORE.MODULE_DATA.moduleRolesData,
	...RH.MODULE_DATA.moduleRolesData,
	...ALMOXARIFADO.MODULE_DATA.moduleRolesData,
	...CHECKLIST.MODULE_DATA.moduleRolesData,
	...RMA.MODULE_DATA.moduleRolesData,
	...CRM.MODULE_DATA.moduleRolesData,
	...FINANCEIRO.MODULE_DATA.moduleRolesData,
} as const;

export const getUserRoleLabel = (role: UserRoleType): string => {
	return ALL_ROLES_DATA[role]?.label || role;
};

export interface ModuleItem {
	title: string;
	description?: string;
	url: string;
	icon: React.ElementType;
	status?: ModuleStatus;
	roles?: UserRoleType[];
}

export interface UserRoleData {
	value: UserRoleType;
	label: string;
	description: string;
	color?: "default" | "secondary" | "destructive" | "outline";
}

export interface ModuleData extends ModuleItem {
	module: string;
	moduleRoles: Record<string, string>;
	moduleRolesData: Record<string, UserRoleData>;
	color: string;
	items?: readonly ModuleItem[];
}
