import { db } from "@/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, like } from "drizzle-orm";
import { z } from "zod";
import {
	createCarteiraSchema,
	findCarteiraSchema,
	listCarteirasSchema,
	updateCarteiraSchema,
} from "../dtos";
import { carteiras } from "../schemas";

export const carteirasRouter = createTRPCRouter({
	// Criar carteira
	create: protectedProcedure
		.input(createCarteiraSchema)
		.mutation(async ({ input, ctx }) => {
			const [carteira] = await db
				.insert(carteiras)
				.values({
					...input,
					userId: ctx.user.id,
				})
				.returning();

			return carteira;
		}),

	// Atualizar carteira
	update: protectedProcedure
		.input(updateCarteiraSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

			const [carteira] = await db
				.update(carteiras)
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where(eq(carteiras.id, id))
				.returning();

			if (!carteira) {
				throw new Error("Carteira não encontrada");
			}

			return carteira;
		}),

	// Buscar carteira por ID
	findById: protectedProcedure
		.input(findCarteiraSchema)
		.query(async ({ input }) => {
			const carteira = await db.query.carteiras.findFirst({
				where: eq(carteiras.id, input.id),
				with: {
					user: {
						columns: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			if (!carteira) {
				throw new Error("Carteira não encontrada");
			}

			return carteira;
		}),

	// Listar carteiras
	list: protectedProcedure
		.input(listCarteirasSchema)
		.query(async ({ input }) => {
			const { page = 1, limit = 20, search, usuarioId } = input;
			const offset = (page - 1) * limit;

			// Construir condições WHERE
			const conditions = [];

			if (search) {
				conditions.push(like(carteiras.nome, `%${search}%`));
			}

			if (usuarioId) {
				conditions.push(eq(carteiras.userId, usuarioId));
			}

			const whereCondition =
				conditions.length > 0 ? and(...conditions) : undefined;

			// Buscar dados
			const data = await db.query.carteiras.findMany({
				where: whereCondition,
				with: {
					user: {
						columns: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				limit,
				offset,
				orderBy: [desc(carteiras.createdAt)],
			});

			// Contar total
			const [countResult] = await db
				.select({ count: count() })
				.from(carteiras)
				.where(whereCondition);

			const total = countResult?.count || 0;
			const totalPages = Math.ceil(total / limit);

			return {
				data,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
			};
		}),

	// Buscar carteiras do usuário logado
	minhasCarteiras: protectedProcedure.query(async ({ ctx }) => {
		return await db.query.carteiras.findMany({
			where: eq(carteiras.userId, ctx.user.id),
			orderBy: [desc(carteiras.createdAt)],
		});
	}),

	// Buscar carteiras para autocomplete
	searchAutocomplete: protectedProcedure
		.input(
			z.object({
				search: z.string().min(2),
				limit: z.number().min(1).max(50).default(10),
			}),
		)
		.query(async ({ input }) => {
			return await db.query.carteiras.findMany({
				where: like(carteiras.nome, `%${input.search}%`),
				columns: {
					id: true,
					nome: true,
					banco: true,
					agencia: true,
					conta: true,
				},
				limit: input.limit,
				orderBy: [carteiras.nome],
			});
		}),

	// Excluir carteira
	delete: protectedProcedure
		.input(z.object({ id: z.number().positive() }))
		.mutation(async ({ input, ctx }) => {
			// Verificar se carteira tem operações
			// TODO: Implementar verificação de operações

			await db.delete(carteiras).where(eq(carteiras.id, input.id));

			return { success: true, message: "Carteira excluída com sucesso" };
		}),

	// Estatísticas da carteira
	estatisticas: protectedProcedure
		.input(z.object({ carteiraId: z.number().positive() }))
		.query(async ({ input }) => {
			// TODO: Implementar estatísticas baseadas em operações e lançamentos
			return {
				totalOperacoes: 0,
				valorTotal: 0,
				saldoAtual: 0,
			};
		}),
});
