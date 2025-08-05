import { createUnidadeSchema, updateUnidadeSchema } from "@/modules/core/dtos";
import { unidadesService } from "@/modules/core/services/unidades.service";
import { adminProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

export const unidadesRouter = {
	findAll: adminProcedure.query(async () => {
		return await unidadesService.findAll();
	}),

	findOne: adminProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const unidade = await unidadesService.findOne(input.id);
			if (!unidade) {
				throw new Error("Unidade não encontrada");
			}
			return unidade;
		}),

	findByCodigo: adminProcedure
		.input(z.object({ codigo: z.number() }))
		.query(async ({ input }) => {
			const unidade = await unidadesService.findByCodigo(input.codigo);
			if (!unidade) {
				throw new Error("Unidade não encontrada");
			}
			return unidade;
		}),

	findByEmpresa: adminProcedure
		.input(z.object({ empresaId: z.number() }))
		.query(async ({ input }) => {
			return await unidadesService.findByEmpresa(input.empresaId);
		}),

	create: adminProcedure
		.input(createUnidadeSchema)
		.mutation(async ({ input }) => {
			return await unidadesService.create(input);
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.number(),
				data: updateUnidadeSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const unidade = await unidadesService.update(input.id, input.data);
			if (!unidade) {
				throw new Error("Unidade não encontrada");
			}
			return unidade;
		}),

	remove: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			await unidadesService.remove(input.id);
			return { message: "Unidade removida com sucesso" };
		}),
} satisfies TRPCRouterRecord;
