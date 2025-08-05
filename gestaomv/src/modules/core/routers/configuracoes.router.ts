import { updateConfiguracoesSistemaSchema } from "@/modules/core/dtos";
import { configuracoesService } from "@/modules/core/services/configuracoes.service";
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

	initializeDefaultSettings: adminProcedure.mutation(async () => {
		await configuracoesService.initializeDefaultSettings();
		return { message: "Configurações padrão inicializadas com sucesso" };
	}),
} satisfies TRPCRouterRecord;
