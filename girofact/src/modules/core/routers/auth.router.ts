import {
	addUserRoleSchema,
	changePasswordSchema,
	emailLoginSchema,
	getUserRolesSchema,
	registerSchema,
	removeUserRoleSchema,
} from "@/modules/core/dtos";
import { authService } from "@/modules/core/services";
import { usersService } from "@/modules/core/services";
import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
} from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";

export const authRouter = {
	login: publicProcedure.input(emailLoginSchema).mutation(async ({ input }) => {
		return authService.login(input);
	}),

	registrar: publicProcedure
		.input(registerSchema)
		.mutation(async ({ input }) => {
			return authService.registrar(input);
		}),

	buscarPerfil: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.user?.id === -1) {
			return authService.perfilSuperadmin();
		}
		return authService.buscarPerfil(ctx.user.id);
	}),

	buscarUserRoles: protectedProcedure
		.input(getUserRolesSchema)
		.query(async ({ input }) => {
			return authService.buscarUserRoles(input.userId);
		}),

	adicionarUserRole: adminProcedure
		.input(addUserRoleSchema)
		.mutation(async ({ input }) => {
			await authService.adicionarUserRole(input);
			return { message: "Role adicionada com sucesso" };
		}),

	removerUserRole: adminProcedure
		.input(removeUserRoleSchema)
		.mutation(async ({ input }) => {
			await authService.removerUserRole(input);
			return { message: "Role removida com sucesso" };
		}),

	logout: protectedProcedure.mutation(async () => {
		// Em uma implementação real, você poderia invalidar o token
		// Por enquanto, apenas retornamos uma mensagem de sucesso
		return { message: "Logout realizado com sucesso" };
	}),

	mudarSenha: protectedProcedure
		.input(changePasswordSchema)
		.mutation(async ({ input, ctx }) => {
			await usersService.mudarSenha(ctx.user.id, {
				currentPassword: input.currentPassword,
				newPassword: input.newPassword,
			});
			return { message: "Senha alterada com sucesso" };
		}),
} satisfies TRPCRouterRecord;
