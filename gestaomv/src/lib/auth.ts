import type { UserRoleType } from "@/modules/core/types";

export interface AuthUser {
	id: number;
	email: string;
	roles: UserRoleType[];
}

export const getTokenFromStorage = (): string | null => {
	if (typeof window === "undefined") return null;

	return (
		localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
	);
};
