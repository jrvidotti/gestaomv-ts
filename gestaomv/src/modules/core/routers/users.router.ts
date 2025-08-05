import { adminProcedure } from "@/integrations/trpc/init";
import { createUserSchema, updateUserSchema } from "@/modules/core/dtos";
import { usersService } from "@/modules/core/services/users.service";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

export const usersRouter = {
	findAll: adminProcedure.query(async () => {
		const users = await usersService.findAll();
		return users.map(({ password, ...user }) => user);
	}),

	findOne: adminProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const user = await usersService.findOne(input.id);
			if (!user) {
				throw new Error("Usuário não encontrado");
			}
			const { password, ...userWithoutPassword } = user;
			return userWithoutPassword;
		}),

	create: adminProcedure.input(createUserSchema).mutation(async ({ input }) => {
		const user = await usersService.create(input);
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}),

	update: adminProcedure
		.input(
			z.object({
				id: z.number(),
				data: updateUserSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const { roles, ...userData } = input.data;
			const user = await usersService.update(input.id, userData, roles);
			if (!user) {
				throw new Error("Usuário não encontrado");
			}
			const { password, ...userWithoutPassword } = user;
			return userWithoutPassword;
		}),

	remove: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			await usersService.remove(input.id);
			return { message: "Usuário removido com sucesso" };
		}),

	findPendingUsers: adminProcedure.query(async () => {
		const pendingUsers = await usersService.findPendingUsers();
		return pendingUsers.map(({ password, ...user }) => user);
	}),

	getUserStats: adminProcedure.query(async () => {
		return await usersService.getUserStats();
	}),
} satisfies TRPCRouterRecord;
