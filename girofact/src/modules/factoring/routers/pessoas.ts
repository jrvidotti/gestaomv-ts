import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import {
	createPessoaSchema,
	findPessoaSchema,
	listPessoasSchema,
	updatePessoaSchema,
} from "../dtos";
import { pessoasService } from "../services";

export const pessoasRouter = createTRPCRouter({
	create: protectedProcedure
		.input(createPessoaSchema)
		.mutation(async ({ input }) => {
			return pessoasService.create(input);
		}),

	findById: protectedProcedure
		.input(findPessoaSchema)
		.query(async ({ input }) => {
			return pessoasService.findById(input);
		}),

	findByDocumento: protectedProcedure
		.input(z.object({ documento: z.string() }))
		.query(async ({ input }) => {
			return pessoasService.findByDocumento(input.documento);
		}),

	list: protectedProcedure.input(listPessoasSchema).query(async ({ input }) => {
		return pessoasService.list(input);
	}),

	update: protectedProcedure
		.input(updatePessoaSchema)
		.mutation(async ({ input }) => {
			return pessoasService.update(input);
		}),

	delete: protectedProcedure
		.input(findPessoaSchema)
		.mutation(async ({ input }) => {
			return pessoasService.delete(input);
		}),

	buscarCep: protectedProcedure
		.input(z.object({ cep: z.string() }))
		.query(async ({ input }) => {
			return pessoasService.buscarCep(input.cep);
		}),

	buscarPorCpfCnpj: protectedProcedure
		.input(z.object({ documento: z.string() }))
		.query(async ({ input }) => {
			return pessoasService.buscarPorCpfCnpj(input.documento);
		}),
});
