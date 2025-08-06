import {
	USER_ROLES_ALMOXARIFADO,
	USER_ROLES_ALMOXARIFADO_DATA,
} from "@/modules/almoxarifado/roles";
import {
	USER_ROLES_CHECKLIST,
	USER_ROLES_CHECKLIST_DATA,
} from "@/modules/checklist/roles";
import { USER_ROLES_CORE, USER_ROLES_CORE_DATA } from "@/modules/core/roles";
import { USER_ROLES_CRM, USER_ROLES_CRM_DATA } from "@/modules/crm/roles";
import {
	USER_ROLES_FINANCEIRO,
	USER_ROLES_FINANCEIRO_DATA,
} from "@/modules/financeiro/roles";
import { USER_ROLES_RH, USER_ROLES_RH_DATA } from "@/modules/rh/roles";
import { USER_ROLES_RMA, USER_ROLES_RMA_DATA } from "@/modules/rma/roles";

// User Roles Constants
export const USER_ROLES = {
	...USER_ROLES_CORE,
	...USER_ROLES_RH,
	...USER_ROLES_ALMOXARIFADO,
	...USER_ROLES_CHECKLIST,
	...USER_ROLES_RMA,
	...USER_ROLES_CRM,
	...USER_ROLES_FINANCEIRO,
} as const;

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLES_ARRAY = Object.values(USER_ROLES) as [
	string,
	...string[],
];

// User Roles Map with Labels
export interface UserRoleData {
	value: UserRoleType;
	label: string;
	description: string;
	color?: "default" | "secondary" | "destructive" | "outline";
}

export const USER_ROLES_DATA: Record<UserRoleType, UserRoleData> = {
	...USER_ROLES_CORE_DATA,
	...USER_ROLES_RH_DATA,
	...USER_ROLES_ALMOXARIFADO_DATA,
	...USER_ROLES_CHECKLIST_DATA,
	...USER_ROLES_RMA_DATA,
	...USER_ROLES_CRM_DATA,
	...USER_ROLES_FINANCEIRO_DATA,
} as const;

// Utility functions
export const getUserRoleLabel = (role: UserRoleType): string => {
	return USER_ROLES_DATA[role]?.label || role;
};
