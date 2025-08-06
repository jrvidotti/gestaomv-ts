import type { UserRoleData } from "@/constants";

export const USER_ROLES = {
	SUPERADMIN: "superadmin",
	ADMIN: "admin",
} as const;

export const USER_ROLES_DATA: Record<
	(typeof USER_ROLES)[keyof typeof USER_ROLES],
	UserRoleData
> = {
	[USER_ROLES.SUPERADMIN]: {
		value: USER_ROLES.SUPERADMIN,
		label: "Superadmin",
		description: "Acesso total ao sistema (superusuário)",
		color: "destructive",
	},
	[USER_ROLES.ADMIN]: {
		value: USER_ROLES.ADMIN,
		label: "Administrador",
		description: "Acesso total ao sistema",
		color: "destructive",
	},
} as const;

export const USER_ROLES_CORE = USER_ROLES;
export const USER_ROLES_CORE_DATA = USER_ROLES_DATA;
