import { createUserSchema, updateUserSchema } from "@/modules/core/dtos";
import { usersService } from "@/modules/core/services/users.service";
import { adminProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

export const usersRouter = {
	listar: adminProcedure.query(async () => {
		const users = await usersService.listar();
		return users.map(({ password, ...user }) => user);
	}),

	buscar: adminProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const user = await usersService.buscar(input.id);
			if (!user) {
				throw new Error("Usuário não encontrado");
			}
			const { password, ...userWithoutPassword } = user;
			return userWithoutPassword;
		}),

	criar: adminProcedure.input(createUserSchema).mutation(async ({ input }) => {
		const user = await usersService.criar(input);
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}),

	atualizar: adminProcedure
		.input(
			z.object({
				id: z.number(),
				data: updateUserSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const { roles, ...userData } = input.data;
			const user = await usersService.atualizar(input.id, userData, roles);
			if (!user) {
				throw new Error("Usuário não encontrado");
			}
			const { password, ...userWithoutPassword } = user;
			return userWithoutPassword;
		}),

	deletar: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			await usersService.deletar(input.id);
			return { message: "Usuário removido com sucesso" };
		}),

	listarUsersPendentes: adminProcedure.query(async () => {
		const pendingUsers = await usersService.listarUsersPendentes();
		return pendingUsers.map(({ password, ...user }) => user);
	}),

	buscarStatusUsuarios: adminProcedure.query(async () => {
		return await usersService.buscarStatusUsuarios();
	}),
} satisfies TRPCRouterRecord;
