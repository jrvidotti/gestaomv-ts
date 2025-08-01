import { getUserFromToken, type AuthUser } from "@/lib/auth";

export interface Context {
	user: AuthUser | null | undefined;
}

export const createTRPCContext = async (req: Request): Promise<Context> => {
	const authorization = req.headers.get("authorization");

	if (!authorization || !authorization.startsWith("Bearer ")) {
		return { user: undefined };
	}

	const token = authorization.replace("Bearer ", "");
	const user = getUserFromToken(token);

	return { user };
};
