import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
} from "@/integrations/trpc/init";
import {
	addUserRoleSchema,
	changePasswordSchema,
	getUserRolesSchema,
	loginSchema,
	registerSchema,
	removeUserRoleSchema,
	tagoneAuthLoginSchema,
} from "@/modules/core/dtos";
import { AuthService } from "@/modules/core/services/auth.service";
import { UsersService } from "@/modules/core/services/users.service";
import type { TRPCRouterRecord } from "@trpc/server";

const authService = new AuthService();
const usersService = new UsersService();

export const authRouter = {
	login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
		return authService.login(input);
	}),

	loginWithTagOne: publicProcedure
		.input(tagoneAuthLoginSchema)
		.mutation(async ({ input }) => {
			return authService.loginWithTagOne(input);
		}),

	register: publicProcedure
		.input(registerSchema)
		.mutation(async ({ input }) => {
			return authService.register(input);
		}),

	profile: protectedProcedure.query(async ({ ctx }) => {
		console.log("ctx.user", ctx.user);
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
