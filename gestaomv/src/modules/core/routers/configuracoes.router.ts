import { adminProcedure } from "@/integrations/trpc/init";
import { updateConfiguracoesSistemaSchema } from "@/modules/core/dtos";
import { ConfiguracoesService } from "@/modules/core/services/configuracoes.service";
import type { TRPCRouterRecord } from "@trpc/server";

const configuracoesService = new ConfiguracoesService();

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
