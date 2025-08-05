import {
	addUserRoleSchema,
	changePasswordSchema,
	emailLoginSchema,
	getUserRolesSchema,
	registerSchema,
	removeUserRoleSchema,
	tagoneLoginSchema,
} from "@/modules/core/dtos";
import { authService } from "@/modules/core/services/auth.service";
import { usersService } from "@/modules/core/services/users.service";
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

	loginWithTagOne: publicProcedure
		.input(tagoneLoginSchema)
		.mutation(async ({ input }) => {
			return authService.loginWithTagOne(input);
		}),

	register: publicProcedure
		.input(registerSchema)
		.mutation(async ({ input }) => {
			return authService.register(input);
		}),

	profile: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.user?.id === -1) {
			return authService.superuserProfile();
		}
		return authService.getUserWithRoles(ctx.user.id);
	}),

	getUserRoles: protectedProcedure
		.input(getUserRolesSchema)
		.query(async ({ input }) => {
			return authService.getUserRoles(input.userId);
		}),

	addUserRole: adminProcedure
		.input(addUserRoleSchema)
		.mutation(async ({ input }) => {
			await authService.addUserRole(input);
			return { message: "Role adicionada com sucesso" };
		}),

	removeUserRole: adminProcedure
		.input(removeUserRoleSchema)
		.mutation(async ({ input }) => {
			await authService.removeUserRole(input);
			return { message: "Role removida com sucesso" };
		}),

	logout: protectedProcedure.mutation(async () => {
		// Em uma implementação real, você poderia invalidar o token
		// Por enquanto, apenas retornamos uma mensagem de sucesso
		return { message: "Logout realizado com sucesso" };
	}),

	changePassword: protectedProcedure
		.input(changePasswordSchema)
		.mutation(async ({ input, ctx }) => {
			await usersService.changePassword(ctx.user.id, {
				currentPassword: input.currentPassword,
				newPassword: input.newPassword,
			});
			return { message: "Senha alterada com sucesso" };
		}),
} satisfies TRPCRouterRecord;
