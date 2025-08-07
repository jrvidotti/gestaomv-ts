import * as CORE from "@/modules/core/module";
import type { ModuleStatus } from "./modules-status";
import * as FACTORING from "@/modules/factoring/module";

/**
 * Dados dos módulos
 * @roles: Roles do usuário que podem acessar o módulo (admin pode acessar tudo)
 * @status: Status do módulo (ativo, desenvolvimento, desabilitado)
 * @items: Itens do módulo
 *   @roles: Roles do usuário que podem acessar o item (caso não seja informado, o atributo é herdado do módulo)
 */
export const MODULES_DATA = [CORE.MODULE_DATA, FACTORING.MODULE_DATA] as const;

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

export interface ModuleItem {
  title: string;
  description?: string;
  url: string;
  icon: React.ElementType;
  status?: ModuleStatus;
  roles?: readonly UserRoleType[];
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
