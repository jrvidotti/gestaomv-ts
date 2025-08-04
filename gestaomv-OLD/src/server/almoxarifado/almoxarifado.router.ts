import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc/trpc.service';
import { MateriaisService } from './materiais.service';
import { SolicitacoesService } from './solicitacoes.service';
import { EstatisticasService } from './estatisticas.service';
import {
  criarMaterialSchema,
  filtroMateriaisSchema,
  atualizarMaterialSchema,
  criarSolicitacaoMaterialSchema,
  filtroSolicitacoesSchema,
  atualizarSolicitacaoSchema,
  atenderSolicitacaoSchema,
  filtroEstatisticasSchema,
  topMateriaisSchema,
} from '@/shared';
import { USER_ROLES } from '@/shared/constants';

@Injectable()
export class AlmoxarifadoRouter {
  private aprovadorProcedure: ReturnType<typeof this.trpcService.createRoleProcedure>;
  private gestorAlmoxarifadoProcedure: ReturnType<typeof this.trpcService.createRoleProcedure>;
  private gerenteAlmoxarifadoProcedure: ReturnType<typeof this.trpcService.createRoleProcedure>;

  constructor(
    private readonly trpcService: TrpcService,
    private readonly materiaisService: MateriaisService,
    private readonly solicitacoesService: SolicitacoesService,
    private readonly estatisticasService: EstatisticasService,
  ) {
    // Procedures específicos por role
    this.aprovadorProcedure = this.trpcService.createRoleProcedure([
      USER_ROLES.ADMIN,
      USER_ROLES.APROVADOR_ALMOXARIFADO,
    ]);
    this.gestorAlmoxarifadoProcedure = this.trpcService.createRoleProcedure([
      USER_ROLES.ADMIN,
      USER_ROLES.APROVADOR_ALMOXARIFADO,
      USER_ROLES.GERENCIA_ALMOXARIFADO,
    ]);
    this.gerenteAlmoxarifadoProcedure = this.trpcService.createRoleProcedure([USER_ROLES.GERENCIA_ALMOXARIFADO]);
  }

  createRouter() {
    return this.trpcService.router({
      listarTiposMaterial: this.trpcService.protectedProcedure.query(async () => {
        return await this.materiaisService.listarTiposMaterial();
      }),

      listarUnidadesMedida: this.trpcService.protectedProcedure.query(async () => {
        return await this.materiaisService.listarUnidadesMedida();
      }),

      // ============ MATERIAIS ============

      criarMaterial: this.trpcService.adminProcedure.input(criarMaterialSchema).mutation(async ({ input }) => {
        return await this.materiaisService.criarMaterial(input);
      }),

      listarMateriais: this.trpcService.protectedProcedure.input(filtroMateriaisSchema).query(async ({ input }) => {
        const filtros = {
          ...input,
          pagina: input.pagina ?? 1,
          limite: input.limite ?? 20,
        };
        return await this.materiaisService.listarMateriais(filtros);
      }),

      buscarMaterial: this.trpcService.protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const material = await this.materiaisService.buscarMaterialPorId(input.id);
          if (!material) {
            throw new Error('Material não encontrado');
          }
          return material;
        }),

      atualizarMaterial: this.trpcService.adminProcedure
        .input(
          z.object({
            id: z.number(),
            data: atualizarMaterialSchema,
          }),
        )
        .mutation(async ({ input }) => {
          const material = await this.materiaisService.atualizarMaterial(input.id, input.data);
          if (!material) {
            throw new Error('Material não encontrado');
          }
          return material;
        }),

      inativarMaterial: this.trpcService.adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await this.materiaisService.inativarMaterial(input.id);
          return { message: 'Material inativado com sucesso' };
        }),

      deletarFotoMaterial: this.trpcService.adminProcedure
        .input(
          z.object({
            materialId: z.number(),
            urlFoto: z.string().url(),
          }),
        )
        .mutation(async ({ input }) => {
          await this.materiaisService.deletarFotoMaterial(input.materialId, input.urlFoto);
          return { message: 'Foto do material deletada com sucesso' };
        }),

      // ============ SOLICITAÇÕES ============

      criarSolicitacao: this.trpcService.protectedProcedure
        .input(criarSolicitacaoMaterialSchema)
        .mutation(async ({ input, ctx }) => {
          const userId = ctx.user?.id;
          if (!userId) {
            throw new Error('Usuário não autenticado');
          }
          return await this.solicitacoesService.criarSolicitacaoMaterial(userId, input);
        }),

      listarSolicitacoes: this.trpcService.protectedProcedure
        .input(filtroSolicitacoesSchema)
        .query(async ({ input, ctx }) => {
          // Usuários podem ver apenas suas próprias solicitações, admins podem ver todas
          const filtros = {
            ...input,
            pagina: input.pagina ?? 1,
            limite: input.limite ?? 20,
          };

          // Se não é admin, mostrar apenas suas próprias solicitações
          if (!ctx.user?.roles?.includes(USER_ROLES.ADMIN) && !ctx.user?.roles?.includes('gerencia_almoxarifado')) {
            filtros.solicitanteId = ctx.user?.id;
          }

          return await this.solicitacoesService.listarSolicitacoesMaterial(filtros);
        }),

      buscarSolicitacao: this.trpcService.protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
          const solicitacao = await this.solicitacoesService.buscarSolicitacaoMaterialPorId(input.id);
          if (!solicitacao) {
            throw new Error('Solicitação não encontrada');
          }

          // Verificar se o usuário pode ver essa solicitação
          const isOwner = solicitacao.solicitanteId === ctx.user?.id;
          const isAdmin =
            ctx.user?.roles?.includes(USER_ROLES.ADMIN) || ctx.user?.roles?.includes('gerencia_almoxarifado');

          if (!isOwner && !isAdmin) {
            throw new Error('Acesso negado');
          }

          return solicitacao;
        }),

      aprovarOuRejeitarSolicitacao: this.aprovadorProcedure
        .input(
          z.object({
            id: z.number(),
            data: atualizarSolicitacaoSchema,
          }),
        )
        .mutation(async ({ input, ctx }) => {
          const userId = ctx.user?.id;
          if (!userId) {
            throw new Error('Usuário não autenticado');
          }

          const dadosAprovacao = {
            ...input.data,
            aprovadorId: userId,
          };

          const solicitacao = await this.solicitacoesService.aprovarOuRejeitarSolicitacao(input.id, dadosAprovacao);
          if (!solicitacao) {
            throw new Error('Solicitação não encontrada');
          }

          return solicitacao;
        }),

      atenderSolicitacao: this.gestorAlmoxarifadoProcedure
        .input(
          z.object({
            id: z.number(),
            data: atenderSolicitacaoSchema,
          }),
        )
        .mutation(async ({ input, ctx }) => {
          const userId = ctx.user?.id;
          if (!userId) {
            throw new Error('Usuário não autenticado');
          }

          const dadosAtendimento = {
            ...input.data,
            atendidoPorId: userId,
          };

          const solicitacao = await this.solicitacoesService.atenderSolicitacao(input.id, dadosAtendimento);
          if (!solicitacao) {
            throw new Error('Solicitação não encontrada');
          }

          return solicitacao;
        }),

      cancelarSolicitacao: this.trpcService.protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const userId = ctx.user?.id;
          if (!userId) {
            throw new Error('Usuário não autenticado');
          }

          const solicitacao = await this.solicitacoesService.cancelarSolicitacao(input.id, userId);
          if (!solicitacao) {
            throw new Error('Solicitação não encontrada ou não pode ser cancelada');
          }

          return solicitacao;
        }),

      atualizarQtdAtendidaAprovador: this.aprovadorProcedure
        .input(
          z.object({
            itemId: z.number(),
            qtdAtendida: z.number().min(0),
          }),
        )
        .mutation(async ({ input }) => {
          return await this.solicitacoesService.atualizarQtdAtendida(input.itemId, input.qtdAtendida, true);
        }),

      atualizarQtdAtendidaGerente: this.gerenteAlmoxarifadoProcedure
        .input(
          z.object({
            itemId: z.number(),
            qtdAtendida: z.number().min(0),
          }),
        )
        .mutation(async ({ input }) => {
          return await this.solicitacoesService.atualizarQtdAtendida(input.itemId, input.qtdAtendida, false);
        }),

      // ============ ESTATÍSTICAS E DASHBOARD ============

      obterEstatisticas: this.trpcService.protectedProcedure
        .input(filtroEstatisticasSchema)
        .query(async ({ input }) => {
          return await this.estatisticasService.obterEstatisticas(input.dataInicial, input.dataFinal, input.status);
        }),

      obterTopMateriais: this.trpcService.protectedProcedure.input(topMateriaisSchema).query(async ({ input }) => {
        const resultado = await this.estatisticasService.obterTopMateriais(
          input.limite,
          input.dataInicial,
          input.dataFinal,
          input.status,
        );
        return resultado;
      }),

      obterUsoPorTipo: this.trpcService.protectedProcedure.input(filtroEstatisticasSchema).query(async ({ input }) => {
        const resultado = await this.estatisticasService.obterUsoPorTipo(
          input.dataInicial,
          input.dataFinal,
          input.status,
        );
        return resultado;
      }),

      obterUsoPorUnidade: this.trpcService.protectedProcedure
        .input(filtroEstatisticasSchema)
        .query(async ({ input }) => {
          const resultado = await this.estatisticasService.obterUsoPorUnidade(
            input.dataInicial,
            input.dataFinal,
            input.status,
          );
          return resultado;
        }),
    });
  }
}

// Export para compatibilidade com código existente
export const almoxarifadoRouter = {};
