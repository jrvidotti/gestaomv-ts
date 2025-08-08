import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { consultarCepSchema, consultarCpfSchema } from "../dtos";
import { directDataService, viaCepService } from "../services";

export const consultasRouter = createTRPCRouter({
	consultarCpf: protectedProcedure
		.input(consultarCpfSchema)
		.mutation(async ({ input }) => {
			return directDataService.consultarCpf(input.documento);
		}),

	consultarCep: protectedProcedure
		.input(consultarCepSchema)
		.query(async ({ input }) => {
			return viaCepService.consultarCep(input.cep);
		}),

	limparCacheExpirado: protectedProcedure.mutation(async () => {
		await directDataService.limparCacheExpirado();
		return { success: true, message: "Cache expirado removido com sucesso" };
	}),
});
