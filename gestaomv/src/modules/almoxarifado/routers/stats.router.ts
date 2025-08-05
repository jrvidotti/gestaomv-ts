import { protectedProcedure } from "@/integrations/trpc/init";
import {
	filtroEstatisticasSchema,
	topMateriaisSchema,
} from "@/modules/almoxarifado/dtos";
import { estatisticasService } from "@/modules/almoxarifado/services/estatisticas.service";
import type { TRPCRouterRecord } from "@trpc/server";

export const statsRouter = {
	obterEstatisticas: protectedProcedure
		.input(filtroEstatisticasSchema)
		.query(async ({ input }) => {
			return await estatisticasService.obterEstatisticas(
				input.dataInicial,
				input.dataFinal,
				input.status,
			);
		}),

	obterTopMateriais: protectedProcedure
		.input(topMateriaisSchema)
		.query(async ({ input }) => {
			const resultado = await estatisticasService.obterTopMateriais(
				input.limite,
				input.dataInicial,
				input.dataFinal,
				input.status,
			);
			return resultado;
		}),

	obterUsoPorTipo: protectedProcedure
		.input(filtroEstatisticasSchema)
		.query(async ({ input }) => {
			const resultado = await estatisticasService.obterUsoPorTipo(
				input.dataInicial,
				input.dataFinal,
				input.status,
			);
			return resultado;
		}),

	obterUsoPorUnidade: protectedProcedure
		.input(filtroEstatisticasSchema)
		.query(async ({ input }) => {
			const resultado = await estatisticasService.obterUsoPorUnidade(
				input.dataInicial,
				input.dataFinal,
				input.status,
			);
			return resultado;
		}),
} satisfies TRPCRouterRecord;
