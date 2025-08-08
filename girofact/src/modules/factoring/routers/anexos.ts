import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
	ArquivarAnexoInputDto,
	CriarAnexoInputDto,
	ListarAnexosPorClienteInputDto,
	ListarAnexosPorDocumentoInputDto,
	ListarAnexosPorOperacaoInputDto,
	ListarAnexosPorPessoaInputDto,
	UploadAnexoInputDto,
} from "../dtos/anexos.dto";
import { AnexosService } from "../services/anexos.service";

const anexosService = new AnexosService();

export const anexosRouter = createTRPCRouter({
	listarPorCliente: protectedProcedure
		.input(ListarAnexosPorClienteInputDto)
		.query(async ({ input }) => {
			return anexosService.listarPorCliente(input.clienteId);
		}),

	listarPorPessoa: protectedProcedure
		.input(ListarAnexosPorPessoaInputDto)
		.query(async ({ input }) => {
			return anexosService.listarPorPessoa(input.pessoaId);
		}),

	listarPorOperacao: protectedProcedure
		.input(ListarAnexosPorOperacaoInputDto)
		.query(async ({ input }) => {
			return anexosService.listarPorOperacao(input.operacaoId);
		}),

	listarPorDocumento: protectedProcedure
		.input(ListarAnexosPorDocumentoInputDto)
		.query(async ({ input }) => {
			return anexosService.listarPorDocumento(input.documentoId);
		}),

	criar: protectedProcedure
		.input(CriarAnexoInputDto)
		.mutation(async ({ input, ctx }) => {
			return anexosService.criar(input, ctx.user.id);
		}),

	upload: protectedProcedure
		.input(UploadAnexoInputDto)
		.mutation(async ({ input, ctx }) => {
			return anexosService.upload(input, ctx.user.id);
		}),

	arquivar: protectedProcedure
		.input(ArquivarAnexoInputDto)
		.mutation(async ({ input }) => {
			return anexosService.arquivar(input.id);
		}),
});
