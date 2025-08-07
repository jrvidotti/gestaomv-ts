import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import {
	analiseCreditoSchema,
	createClienteSchema,
	findClienteSchema,
	listClientesSchema,
	updateClienteSchema,
} from "../dtos";
import { clientesService } from "../services";

export const clientesRouter = createTRPCRouter({
	// Criar cliente
	create: protectedProcedure
		.input(createClienteSchema)
		.mutation(async ({ input, ctx }) => {
			return await clientesService.create(input, ctx.user.id);
		}),

	// Atualizar cliente
	update: protectedProcedure
		.input(updateClienteSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			return await clientesService.update(id, data, ctx.user.id);
		}),

	// Buscar cliente por ID
	findById: protectedProcedure
		.input(findClienteSchema)
		.query(async ({ input }) => {
			return await clientesService.findById(input.id);
		}),

	// Buscar cliente por pessoa ID
	findByPessoaId: protectedProcedure
		.input(z.object({ pessoaId: z.number().positive() }))
		.query(async ({ input }) => {
			return await clientesService.findByPessoaId(input.pessoaId);
		}),

	// Listar clientes com paginação
	list: protectedProcedure
		.input(listClientesSchema)
		.query(async ({ input }) => {
			return await clientesService.list(input);
		}),

	// Busca para autocomplete
	searchAutocomplete: protectedProcedure
		.input(
			z.object({
				search: z.string().min(2),
				status: z
					.enum(["ativo", "inativo", "bloqueado", "suspenso"])
					.optional(),
				limit: z.number().min(1).max(50).default(10),
			}),
		)
		.query(async ({ input }) => {
			return await clientesService.searchForAutocomplete(
				input.search,
				input.status,
				input.limit,
			);
		}),

	// Realizar análise de crédito
	analisarCredito: protectedProcedure
		.input(analiseCreditoSchema)
		.mutation(async ({ input, ctx }) => {
			return await clientesService.realizarAnaliseCredito(input, ctx.user.id);
		}),

	// Calcular limite disponível
	limiteDisponivel: protectedProcedure
		.input(z.object({ clienteId: z.number().positive() }))
		.query(async ({ input }) => {
			const limite = await clientesService.calcularLimiteDisponivel(
				input.clienteId,
			);
			return { limiteDisponivel: limite };
		}),

	// Obter estatísticas
	estatisticas: protectedProcedure.query(async () => {
		return await clientesService.obterEstatisticas();
	}),

	// Histórico de alterações de limite
	historicoLimite: protectedProcedure
		.input(z.object({ clienteId: z.number().positive() }))
		.query(async ({ input }) => {
			const cliente = await clientesService.findById(input.clienteId);
			return cliente.historicoAlteracoesLimite || [];
		}),

	// Bloquear cliente
	bloquear: protectedProcedure
		.input(
			z.object({
				clienteId: z.number().positive(),
				motivo: z.string().min(10, "Motivo é obrigatório"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await clientesService.update(
				input.clienteId,
				{
					status: "bloqueado",
					observacoesCliente: `Bloqueado: ${input.motivo}`,
				},
				ctx.user.id,
			);
		}),

	// Desbloquear cliente
	desbloquear: protectedProcedure
		.input(
			z.object({
				clienteId: z.number().positive(),
				observacoes: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await clientesService.update(
				input.clienteId,
				{
					status: "ativo",
					observacoesCliente: input.observacoes,
				},
				ctx.user.id,
			);
		}),

	// Excluir cliente
	delete: protectedProcedure
		.input(z.object({ id: z.number().positive() }))
		.mutation(async ({ input }) => {
			return await clientesService.delete(input.id);
		}),
});
