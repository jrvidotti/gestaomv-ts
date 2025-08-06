import { ALL_ROLES } from "@/constants";
import type { AuthUser } from "@/lib/auth";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

interface Context {
	user?: AuthUser;
}

const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

// Middleware de logging de erros
const errorLoggingMiddleware = t.middleware(({ path, type, next, ctx }) => {
	const start = Date.now();
	const timestamp = new Date().toISOString();
	const userInfo = ctx.user ? `${ctx.user.email}` : "anonymous";

	return next().then(
		(result) => {
			// Log de sucesso (opcional, pode ser removido se muito verboso)
			const duration = Date.now() - start;
			console.log(
				`[TRPC] [SUCCESS] ${timestamp} user=${userInfo} type=${type} path=${path} duration=${duration}ms`,
			);
			return result;
		},
		(error) => {
			// Log detalhado de erro
			const duration = Date.now() - start;
			console.error(
				`[TRPC] [ERROR] ${timestamp} user=${userInfo} type=${type} path=${path} duration=${duration}ms error=${error.message} (${error.code}) ${
					error.cause ? `cause: ${error.cause}` : ""
				}`,
			);

			// Re-throw para não interferir no fluxo normal
			throw error;
		},
	);
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(errorLoggingMiddleware);

// Procedimentos protegidos (com autenticação)
export const protectedProcedure = t.procedure
	.use(errorLoggingMiddleware)
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
	.use(errorLoggingMiddleware)
	.use(({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Acesso negado. Token de autenticação necessário.",
			});
		}

		// Verifica se o usuário tem role admin (principal ou adicional)
		const hasAdminRole = ctx.user.roles.includes(ALL_ROLES.ADMIN);

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
	return t.procedure.use(errorLoggingMiddleware).use(({ ctx, next }) => {
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
