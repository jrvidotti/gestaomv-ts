import { createEmpresaSchema, updateEmpresaSchema } from "@/modules/core/dtos";
import { empresasService } from "@/modules/core/services";
import { adminProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

export const empresasRouter = {
	listar: adminProcedure.query(async () => {
		return await empresasService.listar();
	}),

	buscar: adminProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const empresa = await empresasService.buscar(input.id);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}
			return empresa;
		}),

	buscarPorCnpj: adminProcedure
		.input(z.object({ cnpj: z.string() }))
		.query(async ({ input }) => {
			const empresa = await empresasService.buscarPorCnpj(input.cnpj);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}
			return empresa;
		}),

	buscarPorPontowebId: adminProcedure
		.input(z.object({ pontowebId: z.number() }))
		.query(async ({ input }) => {
			const empresa = await empresasService.buscarPorPontowebId(
				input.pontowebId,
			);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}
			return empresa;
		}),

	criar: adminProcedure
		.input(createEmpresaSchema)
		.mutation(async ({ input }) => {
			const empresaExistente = await empresasService.buscarPorCnpj(input.cnpj);
			if (empresaExistente) {
				throw new Error("CNPJ já cadastrado no sistema");
			}
			return await empresasService.criar(input);
		}),

	atualizar: adminProcedure
		.input(
			z.object({
				id: z.number(),
				data: updateEmpresaSchema,
			}),
		)
		.mutation(async ({ input }) => {
			if (input.data.cnpj) {
				const empresaExistente = await empresasService.buscarPorCnpj(
					input.data.cnpj,
				);
				if (empresaExistente && empresaExistente.id !== input.id) {
					throw new Error("CNPJ já cadastrado no sistema");
				}
			}

			const empresa = await empresasService.atualizar(input.id, input.data);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}
			return empresa;
		}),

	deletar: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			const empresa = await empresasService.buscar(input.id);
			if (!empresa) {
				throw new Error("Empresa não encontrada");
			}

			if (empresa.unidades && empresa.unidades.length > 0) {
				throw new Error(
					`Não é possível excluir a empresa pois ela possui ${empresa.unidades.length} unidade(s) vinculada(s)`,
				);
			}

			await empresasService.deletar(input.id);
			return { message: "Empresa removida com sucesso" };
		}),
} satisfies TRPCRouterRecord;
