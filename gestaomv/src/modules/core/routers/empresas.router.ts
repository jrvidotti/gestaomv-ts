import { adminProcedure } from "@/integrations/trpc/init";
import { createEmpresaSchema, updateEmpresaSchema } from "@/modules/core/dtos";
import { EmpresasService } from "@/modules/core/services/empresas.service";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

const empresasService = new EmpresasService();

export const empresasRouter = {
	findAll: adminProcedure.query(async () => {
		return await empresasService.findAll();
	}),

	findOne: adminProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const empresa = await empresasService.findOne(input.id);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}
			return empresa;
		}),

	findByCnpj: adminProcedure
		.input(z.object({ cnpj: z.string() }))
		.query(async ({ input }) => {
			const empresa = await empresasService.findByCnpj(input.cnpj);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}
			return empresa;
		}),

	findByPontowebId: adminProcedure
		.input(z.object({ pontowebId: z.number() }))
		.query(async ({ input }) => {
			const empresa = await empresasService.findByPontowebId(input.pontowebId);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}
			return empresa;
		}),

	create: adminProcedure
		.input(createEmpresaSchema)
		.mutation(async ({ input }) => {
			const empresaExistente = await empresasService.findByCnpj(input.cnpj);
			if (empresaExistente) {
				throw new Error("CNPJ já cadastrado no sistema");
			}
			return await empresasService.create(input);
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.number(),
				data: updateEmpresaSchema,
			}),
		)
		.mutation(async ({ input }) => {
			if (input.data.cnpj) {
				const empresaExistente = await empresasService.findByCnpj(
					input.data.cnpj,
				);
				if (empresaExistente && empresaExistente.id !== input.id) {
					throw new Error("CNPJ já cadastrado no sistema");
				}
			}

			const empresa = await empresasService.update(input.id, input.data);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}
			return empresa;
		}),

	remove: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			const empresa = await empresasService.findOne(input.id);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}

			if (empresa.unidades && empresa.unidades.length > 0) {
				throw new Error(
					`Não é possível excluir a empresa pois ela possui ${empresa.unidades.length} unidade(s) vinculada(s)`,
				);
			}

			await empresasService.remove(input.id);
			return { message: "Empresa removida com sucesso" };
		}),
} satisfies TRPCRouterRecord;
