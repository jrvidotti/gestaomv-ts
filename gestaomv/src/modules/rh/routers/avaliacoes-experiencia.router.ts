import { criarAvaliacaoExperienciaSchema } from "@/modules/rh/dtos";
import {
	recomendacaoAvaliacaoEnum,
	tipoAvaliacaoExperienciaEnum,
} from "@/modules/rh/enums";
import { avaliacoesExperienciaService } from "@/modules/rh/services";
import { adminProcedure, protectedProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

export const avaliacoesExperienciaRouter = {
	criar: adminProcedure
		.input(criarAvaliacaoExperienciaSchema)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.user?.id;
			if (!userId) throw new Error("Usuário não autenticado");

			return await avaliacoesExperienciaService.criarAvaliacaoExperiencia({
				...input,
				avaliadorId: userId,
			});
		}),

	listar: protectedProcedure
		.input(
			z.object({
				funcionarioId: z.number().optional(),
				avaliadorId: z.number().optional(),
				tipo: z.enum(tipoAvaliacaoExperienciaEnum).optional(),
				recomendacao: z.enum(recomendacaoAvaliacaoEnum).optional(),
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
			return await avaliacoesExperienciaService.listarAvaliacoesExperiencia(
				filtros,
			);
		}),

	buscar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const avaliacao =
				await avaliacoesExperienciaService.buscarAvaliacaoExperienciaPorId(
					input.id,
				);
			if (!avaliacao) throw new Error("Avaliação não encontrada");
			return avaliacao;
		}),

	buscarPorFuncionario: protectedProcedure
		.input(z.object({ funcionarioId: z.number() }))
		.query(async ({ input }) => {
			return await avaliacoesExperienciaService.buscarAvaliacoesPorFuncionario(
				input.funcionarioId,
			);
		}),
} satisfies TRPCRouterRecord;
