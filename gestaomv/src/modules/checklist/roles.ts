import type { UserRoleData } from "@/constants";

const USER_ROLES = {
	AVALIADOR_CHECKLIST: "avaliador_checklist",
} as const;

export const USER_ROLES_DATA: Record<
	(typeof USER_ROLES)[keyof typeof USER_ROLES],
	UserRoleData
> = {
	[USER_ROLES.AVALIADOR_CHECKLIST]: {
		value: USER_ROLES.AVALIADOR_CHECKLIST,
		label: "Avaliador Checklist",
		description:
			"Responsável por avaliar unidades através de checklists periódicos",
		color: "secondary",
	},
} as const;

export const USER_ROLES_CHECKLIST = USER_ROLES;
export const USER_ROLES_CHECKLIST_DATA = USER_ROLES_DATA;
