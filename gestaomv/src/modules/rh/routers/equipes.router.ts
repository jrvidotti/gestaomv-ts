import { adminProcedure, protectedProcedure } from "@/integrations/trpc/init";
import {
	adicionarFuncionarioEquipeSchema,
	atualizarEquipeSchema,
	criarEquipeSchema,
	filtrosEquipesSchema,
} from "@/modules/rh/dtos";
import { EquipeFuncionariosService } from "@/modules/rh/services/equipe-funcionarios.service";
import { EquipesService } from "@/modules/rh/services/equipes.service";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

const equipesService = new EquipesService();
const equipeFuncionariosService = new EquipeFuncionariosService();

export const equipesRouter = {
	criar: adminProcedure.input(criarEquipeSchema).mutation(async ({ input }) => {
		return await equipesService.criarEquipe(input);
	}),

	listar: protectedProcedure
		.input(filtrosEquipesSchema)
		.query(async ({ input }) => {
			return await equipesService.listarEquipes(input);
		}),

	buscar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const equipe = await equipesService.buscarEquipePorId(input.id);
			if (!equipe) throw new Error("Equipe não encontrada");
			return equipe;
		}),

	atualizar: adminProcedure
		.input(z.object({ id: z.number(), data: atualizarEquipeSchema }))
		.mutation(async ({ input }) => {
			const equipe = await equipesService.atualizarEquipe(input.id, input.data);
			if (!equipe) throw new Error("Equipe não encontrada");
			return equipe;
		}),

	deletar: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			await equipesService.deletarEquipe(input.id);
			return { message: "Equipe deletada com sucesso" };
		}),

	adicionarFuncionario: adminProcedure
		.input(adicionarFuncionarioEquipeSchema)
		.mutation(async ({ input }) => {
			return await equipeFuncionariosService.adicionarFuncionarioEquipe(input);
		}),

	buscarFuncionarios: protectedProcedure
		.input(z.object({ equipeId: z.number() }))
		.query(async ({ input }) => {
			return await equipeFuncionariosService.buscarFuncionariosPorEquipe(
				input.equipeId,
			);
		}),

	buscarPorFuncionario: protectedProcedure
		.input(z.object({ funcionarioId: z.string() }))
		.query(async ({ input }) => {
			return await equipeFuncionariosService.buscarEquipesPorFuncionario(
				input.funcionarioId,
			);
		}),

	definirLider: adminProcedure
		.input(z.object({ funcionarioId: z.string(), equipeId: z.number() }))
		.mutation(async ({ input }) => {
			return await equipeFuncionariosService.definirLiderEquipe(
				input.funcionarioId,
				input.equipeId,
			);
		}),

	removerFuncionario: adminProcedure
		.input(z.object({ funcionarioId: z.string(), equipeId: z.number() }))
		.mutation(async ({ input }) => {
			await equipeFuncionariosService.removerFuncionarioDaEquipe(
				input.funcionarioId,
				input.equipeId,
			);
			return { message: "Funcionário removido da equipe com sucesso" };
		}),
} satisfies TRPCRouterRecord;
