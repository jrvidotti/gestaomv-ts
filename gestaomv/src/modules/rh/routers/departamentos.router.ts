import { adminProcedure, protectedProcedure } from "@/integrations/trpc/init";
import {
	atualizarDepartamentoSchema,
	criarDepartamentoSchema,
	filtrosDepartamentosSchema,
} from "@/modules/rh/dtos";
import { DepartamentosService } from "@/modules/rh/services/departamentos.service";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

const departamentosService = new DepartamentosService();

export const departamentosRouter = {
	criar: adminProcedure
		.input(criarDepartamentoSchema)
		.mutation(async ({ input }) => {
			return await departamentosService.criarDepartamento(input);
		}),

	listar: protectedProcedure
		.input(filtrosDepartamentosSchema)
		.query(async ({ input }) => {
			return await departamentosService.listarDepartamentos(input);
		}),

	buscar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const departamento = await departamentosService.buscarDepartamentoPorId(
				input.id,
			);
			if (!departamento) throw new Error("Departamento não encontrado");
			return departamento;
		}),

	atualizar: adminProcedure
		.input(z.object({ id: z.number(), data: atualizarDepartamentoSchema }))
		.mutation(async ({ input }) => {
			const departamento = await departamentosService.atualizarDepartamento(
				input.id,
				input.data,
			);
			if (!departamento) throw new Error("Departamento não encontrado");
			return departamento;
		}),

	deletar: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			await departamentosService.deletarDepartamento(input.id);
			return { message: "Departamento deletado com sucesso" };
		}),
} satisfies TRPCRouterRecord;
