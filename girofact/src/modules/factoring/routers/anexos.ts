import { protectedProcedure, router } from "@/trpc/init";
import { AnexosService } from "../services/anexos.service";
import {
  ListarAnexosPorClienteInputDto,
  ListarAnexosPorPessoaInputDto,
  ListarAnexosPorOperacaoInputDto,
  ListarAnexosPorDocumentoInputDto,
  CriarAnexoInputDto,
  ArquivarAnexoInputDto,
} from "../dtos/anexos.dto";

const anexosService = new AnexosService();

export const anexosRouter = router({
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

  arquivar: protectedProcedure
    .input(ArquivarAnexoInputDto)
    .mutation(async ({ input }) => {
      return anexosService.arquivar(input.id);
    }),
});