import { adminProcedure, protectedProcedure } from "@/integrations/trpc/init";
import { criarAvaliacaoPeriodicaSchema } from "@/modules/rh/dtos";
import { classificacaoAvaliacaoPeriodicaEnum } from "@/modules/rh/enums";
import { avaliacoesPeriodicasService } from "@/modules/rh/services/avaliacoes-periodicas.service";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

export const avaliacoesPeriodicasRouter = {
	criar: adminProcedure
		.input(criarAvaliacaoPeriodicaSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user?.id;
			if (!userId) throw new Error("Usuário não autenticado");

			return await avaliacoesPeriodicasService.criarAvaliacaoPeriodica({
				...input,
				avaliadorId: userId,
			});
		}),

	listar: protectedProcedure
		.input(
			z.object({
				funcionarioId: z.number().optional(),
				avaliadorId: z.number().optional(),
				classificacao: z.enum(classificacaoAvaliacaoPeriodicaEnum).optional(),
				periodoInicial: z.string().optional(),
				periodoFinal: z.string().optional(),
				dataInicial: z.string().optional(),
				dataFinal: z.string().optional(),
				pagina: z.number().min(1).optional(),
				limite: z.number().min(1).max(100).optional(),
			}),
		)
		.query(async ({ input }) => {
			const filtros = {
				...input,
				pagina: input.pagina ?? 1,
				limite: input.limite ?? 20,
			};
			return await avaliacoesPeriodicasService.listarAvaliacoesPeriodicas(
				filtros,
			);
		}),

	buscar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const avaliacao =
				await avaliacoesPeriodicasService.buscarAvaliacaoPeriodicaPorId(
					input.id,
				);
			if (!avaliacao) throw new Error("Avaliação não encontrada");
			return avaliacao;
		}),

	buscarPorFuncionario: protectedProcedure
		.input(z.object({ funcionarioId: z.number() }))
		.query(async ({ input }) => {
			return await avaliacoesPeriodicasService.buscarAvaliacoesPorFuncionario(
				input.funcionarioId,
			);
		}),
} satisfies TRPCRouterRecord;
