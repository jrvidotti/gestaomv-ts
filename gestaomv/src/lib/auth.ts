import type { UserRoleType } from "@/modules/core/types";
import jwt from "jsonwebtoken";

export interface AuthUser {
	id: number;
	email: string;
	roles: UserRoleType[];
}

export const getUserFromToken = (token: string): AuthUser | null => {
	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "your-secret-key",
		) as {
			sub: string;
			email: string;
			roles: UserRoleType[];
		};

		return {
			id: Number.parseInt(decoded.sub, 10),
			email: decoded.email,
			roles: decoded.roles || [],
		};
	} catch (error) {
		console.error("[Auth] Erro ao verificar token:", error);
		return null;
	}
};

export const getUserFromStorage = (): AuthUser | null => {
	if (typeof window === "undefined") return null;

	const token =
		localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
	if (!token) return null;

	return getUserFromToken(token);
};
