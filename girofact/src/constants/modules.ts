import * as CORE from "@/modules/core/module";
import * as FACTORING from "@/modules/factoring/module";
import type { ModuleStatus } from "./modules-status";

/**
 * Dados dos módulos
 * @roles: Roles do usuário que podem acessar o módulo (admin pode acessar tudo)
 * @status: Status do módulo (ativo, desenvolvimento, desabilitado)
 * @items: Itens do módulo
 *   @roles: Roles do usuário que podem acessar o item (caso não seja informado, o atributo é herdado do módulo)
 */
const MODULES_DATA_RAW = [CORE.MODULE_DATA, FACTORING.MODULE_DATA] as const;

export const MODULES_DATA = MODULES_DATA_RAW;

export const MODULE = {
	CORE: "core",
	FACTORING: "factoring",
} as const;

export type ModuleType = (typeof MODULE)[keyof typeof MODULE];

export const MODULES = Object.values(MODULE);

export const ALL_ROLES = {
	...CORE.MODULE_ROLES,
	...FACTORING.MODULE_ROLES,
} as const;

export type UserRoleType = (typeof ALL_ROLES)[keyof typeof ALL_ROLES];

export const USER_ROLES_ARRAY = Object.values(ALL_ROLES);

export const ALL_ROLES_DATA = {
	...CORE.MODULE_DATA.moduleRolesData,
	...FACTORING.MODULE_DATA.moduleRolesData,
} as const;

export const getUserRoleLabel = (role: UserRoleType): string => {
	return ALL_ROLES_DATA[role]?.label || role;
};

/**
 * Valida se a estrutura do menu não ultrapassa 2 níveis de profundidade
 * @param items - Itens do menu para validar
 * @param currentDepth - Nível atual (usado internamente na recursão)
 * @throws {Error} - Lança erro se encontrar mais de 2 níveis
 */
export function validateMenuDepth(
	items: readonly ModuleItem[],
	currentDepth = 0,
): void {
	if (currentDepth >= 2) {
		throw new Error("Menu não pode ter mais de 2 níveis de profundidade");
	}

	items.forEach((item) => {
		if (item.items && item.items.length > 0) {
			validateMenuDepth(item.items, currentDepth + 1);
		}
	});
}

export interface ModuleItem {
	title: string;
	description?: string;
	url: string;
	icon: React.ElementType;
	status?: ModuleStatus;
	roles?: readonly UserRoleType[];
	items?: readonly ModuleItem[];
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

// Validar a estrutura dos módulos na inicialização
MODULES_DATA.forEach((module) => {
	if (module.items) {
		validateMenuDepth(module.items);
	}
});
