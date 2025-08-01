import { adminProcedure, protectedProcedure } from "@/integrations/trpc/init";
import {
	atualizarCargoSchema,
	criarCargoSchema,
	filtrosCargosSchema,
} from "@/modules/rh/dtos";
import { CargosService } from "@/modules/rh/services/cargos.service";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

const cargosService = new CargosService();

export const cargosRouter = {
	criar: adminProcedure
		.input(criarCargoSchema)
		.mutation(async ({ input }) => {
			return await cargosService.criarCargo(input);
		}),

	listar: protectedProcedure
		.input(filtrosCargosSchema)
		.query(async ({ input }) => {
			return await cargosService.listarCargos(input);
		}),

	buscar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const cargo = await cargosService.buscarCargoPorId(input.id);
			if (!cargo) throw new Error("Cargo não encontrado");
			return cargo;
		}),

	buscarPorDepartamento: protectedProcedure
		.input(z.object({ departamentoId: z.number() }))
		.query(async ({ input }) => {
			return await cargosService.buscarCargosPorDepartamento(
				input.departamentoId,
			);
		}),

	atualizar: adminProcedure
		.input(z.object({ id: z.number(), data: atualizarCargoSchema }))
		.mutation(async ({ input }) => {
			const cargo = await cargosService.atualizarCargo(input.id, input.data);
			if (!cargo) throw new Error("Cargo não encontrado");
			return cargo;
		}),

	deletar: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			await cargosService.deletarCargo(input.id);
			return { message: "Cargo deletado com sucesso" };
		}),
} satisfies TRPCRouterRecord;