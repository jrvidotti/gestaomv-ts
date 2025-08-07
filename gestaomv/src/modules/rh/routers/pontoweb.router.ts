import {
	importarFuncionariosSchema,
	sincronizarAfastamentosSchema,
} from "@/modules/core/dtos";
import { pontowebService } from "@/modules/rh/services";
import { adminProcedure, protectedProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";

export const pontowebRouter = {
	importarFuncionarios: adminProcedure
		.input(importarFuncionariosSchema)
		.mutation(async ({ input }) => {
			return await pontowebService.importarFuncionariosPontoWeb(
				input.modoAtualizar,
			);
		}),

	sincronizarAfastamentos: adminProcedure
		.input(sincronizarAfastamentosSchema)
		.mutation(async ({ input }) => {
			return await pontowebService.sincronizarAfastamentos(
				input.diasRetroativos,
			);
		}),

	obterMotivosDemissao: protectedProcedure.query(async () => {
		return await pontowebService.obterMotivosDemissao();
	}),
} satisfies TRPCRouterRecord;
