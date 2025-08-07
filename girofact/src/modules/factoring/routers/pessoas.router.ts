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
	// Criar pessoa
	create: protectedProcedure
		.input(createPessoaSchema)
		.mutation(async ({ input, ctx }) => {
			return await pessoasService.create(input, ctx.user.id);
		}),

	// Atualizar pessoa
	update: protectedProcedure
		.input(updatePessoaSchema.extend({ id: z.number().positive() }))
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			return await pessoasService.update(id, data, ctx.user.id);
		}),

	// Buscar pessoa por ID
	findById: protectedProcedure
		.input(findPessoaSchema)
		.query(async ({ input }) => {
			return await pessoasService.findById(input.id);
		}),

	// Buscar pessoa por documento
	findByDocumento: protectedProcedure
		.input(z.object({ documento: z.string() }))
		.query(async ({ input }) => {
			return await pessoasService.findByDocumento(input.documento);
		}),

	// Listar pessoas com paginação
	list: protectedProcedure.input(listPessoasSchema).query(async ({ input }) => {
		return await pessoasService.list(input);
	}),

	// Busca para autocomplete
	searchAutocomplete: protectedProcedure
		.input(
			z.object({
				search: z.string().min(2),
				tipoPessoa: z.enum(["fisica", "juridica"]).optional(),
				limit: z.number().min(1).max(50).default(10),
			}),
		)
		.query(async ({ input }) => {
			return await pessoasService.searchForAutocomplete(
				input.search,
				input.tipoPessoa,
				input.limit,
			);
		}),

	// Verificar se documento já existe
	checkDocumento: protectedProcedure
		.input(
			z.object({
				documento: z.string(),
				excludeId: z.number().positive().optional(),
			}),
		)
		.query(async ({ input }) => {
			const exists = await pessoasService.documentoExists(
				input.documento,
				input.excludeId,
			);
			return { exists };
		}),

	// Excluir pessoa
	delete: protectedProcedure
		.input(z.object({ id: z.number().positive() }))
		.mutation(async ({ input }) => {
			return await pessoasService.delete(input.id);
		}),

	// Consultar CPF/CNPJ na API externa (placeholder)
	consultarDocumento: protectedProcedure
		.input(
			z.object({
				documento: z.string(),
				tipoPessoa: z.enum(["fisica", "juridica"]),
			}),
		)
		.query(async ({ input }) => {
			// TODO: Implementar integração com API Direct Data
			return {
				sucesso: false,
				mensagem: "Integração com API Direct Data ainda não implementada",
				dados: null,
			};
		}),
});
