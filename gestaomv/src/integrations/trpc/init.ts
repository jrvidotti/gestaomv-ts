import type { AuthUser } from "@/lib/auth";
import { USER_ROLES } from "@/modules/core/enums";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

interface Context {
	user?: AuthUser;
}

const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Procedimentos protegidos (com autenticação)
export const protectedProcedure = t.procedure
	// .use(this.loggingMiddleware)
	.use(({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Acesso negado. Token de autenticação necessário.",
			});
		}

		return next({
			ctx: {
				user: ctx.user,
			},
		});
	});

// Procedimentos que requerem role admin
export const adminProcedure = t.procedure
	// .use(this.loggingMiddleware)
	.use(({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Acesso negado. Token de autenticação necessário.",
			});
		}

		// Verifica se o usuário tem role admin (principal ou adicional)
		const hasAdminRole = ctx.user.roles.includes(USER_ROLES.ADMIN);

		if (!hasAdminRole) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Acesso negado. Permissão de administrador necessária.",
			});
		}

		return next({
			ctx: {
				user: ctx.user,
			},
		});
	});

// Novo: Procedimento que verifica se o usuário tem pelo menos uma das roles especificadas
export const createRoleProcedure = (allowedRoles: string[]) => {
	return t.procedure.use(({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Acesso negado. Token de autenticação necessário.",
			});
		}

		const hasRole = ctx.user.roles.some((role) => allowedRoles.includes(role));

		if (!hasRole) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: `Acesso negado. Permissões necessárias: ${allowedRoles.join(", ")}.`,
			});
		}

		return next({
			ctx: {
				user: ctx.user,
			},
		});
	});
};
