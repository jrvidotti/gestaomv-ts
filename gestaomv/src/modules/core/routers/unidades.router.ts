import { createUnidadeSchema, updateUnidadeSchema } from "@/modules/core/dtos";
import { unidadesService } from "@/modules/core/services";
import { adminProcedure, protectedProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

export const unidadesRouter = {
	listar: protectedProcedure.query(async () => {
		return await unidadesService.listar();
	}),

	buscar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const unidade = await unidadesService.buscar(input.id);
			if (!unidade) {
				throw new Error("Unidade não encontrada");
			}
			return unidade;
		}),

	buscarPorCodigo: protectedProcedure
		.input(z.object({ codigo: z.number() }))
		.query(async ({ input }) => {
			const unidade = await unidadesService.buscarPorCodigo(input.codigo);
			if (!unidade) {
				throw new Error("Unidade não encontrada");
			}
			return unidade;
		}),

	buscarPorEmpresa: protectedProcedure
		.input(z.object({ empresaId: z.number() }))
		.query(async ({ input }) => {
			return await unidadesService.buscarPorEmpresa(input.empresaId);
		}),

	criar: adminProcedure
		.input(createUnidadeSchema)
		.mutation(async ({ input }) => {
			return await unidadesService.criar(input);
		}),

	atualizar: adminProcedure
		.input(
			z.object({
				id: z.number(),
				data: updateUnidadeSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const unidade = await unidadesService.atualizar(input.id, input.data);
			if (!unidade) {
				throw new Error("Unidade não encontrada");
			}
			return unidade;
		}),

	deletar: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			await unidadesService.deletar(input.id);
			return { message: "Unidade removida com sucesso" };
		}),
} satisfies TRPCRouterRecord;
