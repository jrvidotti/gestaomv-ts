import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
	cancelarOperacaoSchema,
	efetivarOperacaoSchema,
	findOperacaoSchema,
	liquidarOperacaoSchema,
	listOperacoesSchema,
	removeDocumentoSchema,
	upsertDocumentoSchema,
	upsertOperacaoSchema,
} from "../dtos";
import { operacoesService } from "../services";

export const operacoesRouter = createTRPCRouter({
	upsertOperacao: protectedProcedure
		.input(upsertOperacaoSchema)
		.mutation(async ({ input, ctx }) => {
			return operacoesService.upsertOperacao(input, ctx.user.id);
		}),

	upsertDocumento: protectedProcedure
		.input(upsertDocumentoSchema)
		.mutation(async ({ input, ctx }) => {
			return operacoesService.upsertDocumento(input, ctx.user.id);
		}),

	removeDocumento: protectedProcedure
		.input(removeDocumentoSchema)
		.mutation(async ({ input }) => {
			return operacoesService.removeDocumento(input);
		}),

	efetivar: protectedProcedure
		.input(efetivarOperacaoSchema)
		.mutation(async ({ input, ctx }) => {
			return operacoesService.efetivarOperacao(input, ctx.user.id);
		}),

	cancelar: protectedProcedure
		.input(cancelarOperacaoSchema)
		.mutation(async ({ input }) => {
			return operacoesService.cancelarOperacao(input);
		}),

	liquidar: protectedProcedure
		.input(liquidarOperacaoSchema)
		.mutation(async ({ input }) => {
			return operacoesService.liquidarOperacao(input);
		}),

	findByUid: protectedProcedure
		.input(findOperacaoSchema)
		.query(async ({ input }) => {
			return operacoesService.findByUid(input);
		}),

	list: protectedProcedure
		.input(listOperacoesSchema)
		.query(async ({ input }) => {
			return operacoesService.list(input);
		}),
});
