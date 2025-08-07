import {
	alterarStatusFuncionarioSchema,
	atualizarFuncionarioSchema,
	criarFuncionarioSchema,
	criarUserFuncionarioSchema,
	filtrosFuncionariosSchema,
} from "@/modules/rh/dtos";
import { funcionariosService } from "@/modules/rh/services";
import { userFuncionariosService } from "@/modules/rh/services";
import { adminProcedure, protectedProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

export const funcionariosRouter = {
	criar: adminProcedure
		.input(criarFuncionarioSchema)
		.mutation(async ({ input }) => {
			return await funcionariosService.criarFuncionario(input);
		}),

	listar: protectedProcedure
		.input(filtrosFuncionariosSchema)
		.query(async ({ input }) => {
			return await funcionariosService.listarFuncionarios(input);
		}),

	buscar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const funcionario = await funcionariosService.buscarFuncionarioPorId(
				input.id,
			);
			if (!funcionario) throw new Error("Funcionário não encontrado");
			return funcionario;
		}),

	buscarPorDepartamento: protectedProcedure
		.input(z.object({ departamentoId: z.number() }))
		.query(async ({ input }) => {
			return await funcionariosService.buscarFuncionariosPorDepartamento(
				input.departamentoId,
			);
		}),

	buscarPorCargo: protectedProcedure
		.input(z.object({ cargoId: z.number() }))
		.query(async ({ input }) => {
			return await funcionariosService.buscarFuncionariosPorCargo(
				input.cargoId,
			);
		}),

	atualizar: adminProcedure
		.input(z.object({ id: z.number(), data: atualizarFuncionarioSchema }))
		.mutation(async ({ input }) => {
			const funcionario = await funcionariosService.atualizarFuncionario(
				input.id,
				input.data,
			);
			if (!funcionario) throw new Error("Funcionário não encontrado");
			return funcionario;
		}),

	alterarStatus: adminProcedure
		.input(z.object({ id: z.number(), data: alterarStatusFuncionarioSchema }))
		.mutation(async ({ input }) => {
			const funcionario = await funcionariosService.alterarStatusFuncionario(
				input.id,
				input.data.status,
				{
					dataAvisoPrevio: input.data.dataAvisoPrevio,
					dataDesligamento: input.data.dataDesligamento,
				},
			);
			if (!funcionario) throw new Error("Funcionário não encontrado");
			return funcionario;
		}),

	deletar: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			await funcionariosService.deletarFuncionario(input.id);
			return { message: "Funcionário deletado com sucesso" };
		}),

	criarUserFuncionario: adminProcedure
		.input(criarUserFuncionarioSchema)
		.mutation(async ({ input }) => {
			return await userFuncionariosService.criarUserFuncionario(input);
		}),

	buscarPorUser: protectedProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ input }) => {
			return await userFuncionariosService.buscarFuncionarioPorUser(
				input.userId,
			);
		}),

	deletarUserFuncionario: adminProcedure
		.input(z.object({ userId: z.string(), funcionarioId: z.string() }))
		.mutation(async ({ input }) => {
			await userFuncionariosService.deletarUserFuncionario(
				input.userId,
				input.funcionarioId,
			);
			return { message: "Vínculo removido com sucesso" };
		}),
} satisfies TRPCRouterRecord;
