import type { UserRoleType } from "@/constants";
import jwt from "jsonwebtoken";

export interface AuthUser {
	id: number;
	email: string;
	roles: UserRoleType[];
}

export const authenticateRequest = (req: Request): AuthUser | null => {
	const authHeader = req.headers.get("authorization");
	const [authType, token] = authHeader?.split(" ") || ["", ""];
	const hasToken = authType === "Bearer" && !!token;
	return hasToken ? getUserFromToken(token) : null;
};

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
