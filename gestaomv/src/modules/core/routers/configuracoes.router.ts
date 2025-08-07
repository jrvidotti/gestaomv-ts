import { updateConfiguracoesSistemaSchema } from "@/modules/core/dtos";
import { configuracoesService } from "@/modules/core/services";
import { adminProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";

export const configuracoesRouter = {
	getConfiguracoesSistema: adminProcedure.query(async () => {
		return await configuracoesService.getConfiguracoesSistema();
	}),

	updateConfiguracoesSistema: adminProcedure
		.input(updateConfiguracoesSistemaSchema)
		.mutation(async ({ input }) => {
			return await configuracoesService.updateConfiguracoesSistema(input);
		}),

	initiacializarConfiguracoesPadrao: adminProcedure.mutation(async () => {
		await configuracoesService.initiacializarConfiguracoesPadrao();
		return { message: "Configurações padrão inicializadas com sucesso" };
	}),
} satisfies TRPCRouterRecord;
