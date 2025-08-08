import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
	agendaVencimentosSchema,
	compensacaoLoteSchema,
	devolucaoDocumentoSchema,
	listDocumentosSchema,
	pagamentoDocumentoSchema,
	posicaoDocumentosSchema,
	prorrogacaoDocumentoSchema,
	resgateDocumentoSchema,
} from "../dtos";
import { documentosService } from "../services";

export const documentosRouter = createTRPCRouter({
	compensacaoLote: protectedProcedure
		.input(compensacaoLoteSchema)
		.mutation(async ({ input, ctx }) => {
			return documentosService.compensacaoLote(input, ctx.user.id);
		}),

	devolver: protectedProcedure
		.input(devolucaoDocumentoSchema)
		.mutation(async ({ input, ctx }) => {
			return documentosService.devolverDocumento(input, ctx.user.id);
		}),

	prorrogar: protectedProcedure
		.input(prorrogacaoDocumentoSchema)
		.mutation(async ({ input, ctx }) => {
			return documentosService.prorrogarDocumento(input, ctx.user.id);
		}),

	list: protectedProcedure
		.input(listDocumentosSchema)
		.query(async ({ input }) => {
			return documentosService.list(input);
		}),

	agendaVencimentos: protectedProcedure
		.input(agendaVencimentosSchema)
		.query(async ({ input }) => {
			return documentosService.agendaVencimentos(input);
		}),

	resgatar: protectedProcedure
		.input(resgateDocumentoSchema)
		.mutation(async ({ input, ctx }) => {
			return documentosService.resgateDocumento(input, ctx.user.id);
		}),

	pagar: protectedProcedure
		.input(pagamentoDocumentoSchema)
		.mutation(async ({ input, ctx }) => {
			return documentosService.pagarDocumento(input, ctx.user.id);
		}),

	posicaoDocumentos: protectedProcedure
		.input(posicaoDocumentosSchema)
		.query(async ({ input }) => {
			return documentosService.posicaoDocumentos(input);
		}),
});
