import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TrpcService } from '../trpc/trpc.service';
import { EquipesService } from './equipes.service';
import { DepartamentosService } from './departamentos.service';
import { CargosService } from './cargos.service';
import { FuncionariosService } from './funcionarios.service';
import { UserFuncionariosService } from './user-funcionarios.service';
import { EquipeFuncionariosService } from './equipe-funcionarios.service';
import { AvaliacoesExperienciaService } from './avaliacoes-experiencia.service';
import { AvaliacoesPeriodicasService } from './avaliacoes-periodicas.service';
import { PontowebService } from '../pontoweb/pontoweb.service';
import { EmpresasService } from '../base/empresas.service';
import { UnidadesService } from '../base/unidades.service';
import {
  statusFuncionarioEnum,
  tipoAvaliacaoExperienciaEnum,
  recomendacaoAvaliacaoEnum,
  classificacaoAvaliacaoPeriodicaEnum,
  // Importar todos os schemas Zod do shared
  criarEquipeSchema,
  atualizarEquipeSchema,
  filtrosEquipesSchema,
  criarDepartamentoSchema,
  atualizarDepartamentoSchema,
  filtrosDepartamentosSchema,
  criarCargoSchema,
  atualizarCargoSchema,
  filtrosCargosSchema,
  criarFuncionarioSchema,
  atualizarFuncionarioSchema,
  filtrosFuncionariosSchema,
  alterarStatusFuncionarioSchema,
  criarUserFuncionarioSchema,
  adicionarFuncionarioEquipeSchema,
  atualizarEquipeFuncionarioSchema,
  criarAvaliacaoExperienciaSchema,
  criarAvaliacaoPeriodicaSchema,
  importarFuncionariosSchema,
  sincronizarAfastamentosSchema,
} from '@/shared';

@Injectable()
export class RhRouter {
  private pontowebService: PontowebService;

  constructor(
    private readonly trpcService: TrpcService,
    private readonly equipesService: EquipesService,
    private readonly departamentosService: DepartamentosService,
    private readonly cargosService: CargosService,
    private readonly funcionariosService: FuncionariosService,
    private readonly userFuncionariosService: UserFuncionariosService,
    private readonly equipeFuncionariosService: EquipeFuncionariosService,
    private readonly avaliacoesExperienciaService: AvaliacoesExperienciaService,
    private readonly avaliacoesPeriodicasService: AvaliacoesPeriodicasService,
    private readonly empresasService: EmpresasService,
    private readonly unidadesService: UnidadesService,
  ) {
    this.pontowebService = new PontowebService(
      this.funcionariosService,
      this.departamentosService,
      this.cargosService,
      this.empresasService,
      this.unidadesService,
    );
  }

  createRouter() {
    return this.trpcService.router({
      // ============ EQUIPES ============
      criarEquipe: this.trpcService.adminProcedure.input(criarEquipeSchema).mutation(async ({ input }) => {
        return await this.equipesService.criarEquipe(input);
      }),

      listarEquipes: this.trpcService.protectedProcedure.input(filtrosEquipesSchema).query(async ({ input }) => {
        return await this.equipesService.listarEquipes(input);
      }),

      buscarEquipe: this.trpcService.protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const equipe = await this.equipesService.buscarEquipePorId(input.id);
        if (!equipe) throw new Error('Equipe não encontrada');
        return equipe;
      }),

      atualizarEquipe: this.trpcService.adminProcedure
        .input(z.object({ id: z.number(), data: atualizarEquipeSchema }))
        .mutation(async ({ input }) => {
          const equipe = await this.equipesService.atualizarEquipe(input.id, input.data);
          if (!equipe) throw new Error('Equipe não encontrada');
          return equipe;
        }),

      deletarEquipe: this.trpcService.adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await this.equipesService.deletarEquipe(input.id);
        return { message: 'Equipe deletada com sucesso' };
      }),

      // ============ DEPARTAMENTOS ============
      criarDepartamento: this.trpcService.adminProcedure.input(criarDepartamentoSchema).mutation(async ({ input }) => {
        return await this.departamentosService.criarDepartamento(input);
      }),

      listarDepartamentos: this.trpcService.protectedProcedure
        .input(filtrosDepartamentosSchema)
        .query(async ({ input }) => {
          return await this.departamentosService.listarDepartamentos(input);
        }),

      buscarDepartamento: this.trpcService.protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const departamento = await this.departamentosService.buscarDepartamentoPorId(input.id);
          if (!departamento) throw new Error('Departamento não encontrado');
          return departamento;
        }),

      atualizarDepartamento: this.trpcService.adminProcedure
        .input(z.object({ id: z.number(), data: atualizarDepartamentoSchema }))
        .mutation(async ({ input }) => {
          const departamento = await this.departamentosService.atualizarDepartamento(input.id, input.data);
          if (!departamento) throw new Error('Departamento não encontrado');
          return departamento;
        }),

      deletarDepartamento: this.trpcService.adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await this.departamentosService.deletarDepartamento(input.id);
          return { message: 'Departamento deletado com sucesso' };
        }),

      // ============ CARGOS ============
      criarCargo: this.trpcService.adminProcedure.input(criarCargoSchema).mutation(async ({ input }) => {
        return await this.cargosService.criarCargo(input);
      }),

      listarCargos: this.trpcService.protectedProcedure.input(filtrosCargosSchema).query(async ({ input }) => {
        return await this.cargosService.listarCargos(input);
      }),

      buscarCargo: this.trpcService.protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const cargo = await this.cargosService.buscarCargoPorId(input.id);
        if (!cargo) throw new Error('Cargo não encontrado');
        return cargo;
      }),

      buscarCargosPorDepartamento: this.trpcService.protectedProcedure
        .input(z.object({ departamentoId: z.number() }))
        .query(async ({ input }) => {
          return await this.cargosService.buscarCargosPorDepartamento(input.departamentoId);
        }),

      atualizarCargo: this.trpcService.adminProcedure
        .input(z.object({ id: z.number(), data: atualizarCargoSchema }))
        .mutation(async ({ input }) => {
          const cargo = await this.cargosService.atualizarCargo(input.id, input.data);
          if (!cargo) throw new Error('Cargo não encontrado');
          return cargo;
        }),

      deletarCargo: this.trpcService.adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await this.cargosService.deletarCargo(input.id);
        return { message: 'Cargo deletado com sucesso' };
      }),

      // ============ FUNCIONÁRIOS ============
      criarFuncionario: this.trpcService.adminProcedure.input(criarFuncionarioSchema).mutation(async ({ input }) => {
        return await this.funcionariosService.criarFuncionario(input);
      }),

      listarFuncionarios: this.trpcService.protectedProcedure
        .input(filtrosFuncionariosSchema)
        .query(async ({ input }) => {
          return await this.funcionariosService.listarFuncionarios(input);
        }),

      buscarFuncionario: this.trpcService.protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const funcionario = await this.funcionariosService.buscarFuncionarioPorId(input.id);
          if (!funcionario) throw new Error('Funcionário não encontrado');
          return funcionario;
        }),

      buscarFuncionariosPorDepartamento: this.trpcService.protectedProcedure
        .input(z.object({ departamentoId: z.number() }))
        .query(async ({ input }) => {
          return await this.funcionariosService.buscarFuncionariosPorDepartamento(input.departamentoId);
        }),

      buscarFuncionariosPorCargo: this.trpcService.protectedProcedure
        .input(z.object({ cargoId: z.number() }))
        .query(async ({ input }) => {
          return await this.funcionariosService.buscarFuncionariosPorCargo(input.cargoId);
        }),

      atualizarFuncionario: this.trpcService.adminProcedure
        .input(z.object({ id: z.number(), data: atualizarFuncionarioSchema }))
        .mutation(async ({ input }) => {
          const funcionario = await this.funcionariosService.atualizarFuncionario(input.id, input.data);
          if (!funcionario) throw new Error('Funcionário não encontrado');
          return funcionario;
        }),

      alterarStatusFuncionario: this.trpcService.adminProcedure
        .input(z.object({ id: z.number(), data: alterarStatusFuncionarioSchema }))
        .mutation(async ({ input }) => {
          const funcionario = await this.funcionariosService.alterarStatusFuncionario(input.id, input.data.status, {
            dataAvisoPrevio: input.data.dataAvisoPrevio,
            dataDesligamento: input.data.dataDesligamento,
          });
          if (!funcionario) throw new Error('Funcionário não encontrado');
          return funcionario;
        }),

      deletarFuncionario: this.trpcService.adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await this.funcionariosService.deletarFuncionario(input.id);
          return { message: 'Funcionário deletado com sucesso' };
        }),

      // ============ USER FUNCIONÁRIOS ============
      criarUserFuncionario: this.trpcService.adminProcedure
        .input(criarUserFuncionarioSchema)
        .mutation(async ({ input }) => {
          return await this.userFuncionariosService.criarUserFuncionario(input);
        }),

      buscarFuncionarioPorUser: this.trpcService.protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
          return await this.userFuncionariosService.buscarFuncionarioPorUser(input.userId);
        }),

      deletarUserFuncionario: this.trpcService.adminProcedure
        .input(z.object({ userId: z.string(), funcionarioId: z.string() }))
        .mutation(async ({ input }) => {
          await this.userFuncionariosService.deletarUserFuncionario(input.userId, input.funcionarioId);
          return { message: 'Vínculo removido com sucesso' };
        }),

      // ============ EQUIPE FUNCIONÁRIOS ============
      adicionarFuncionarioEquipe: this.trpcService.adminProcedure
        .input(adicionarFuncionarioEquipeSchema)
        .mutation(async ({ input }) => {
          return await this.equipeFuncionariosService.adicionarFuncionarioEquipe(input);
        }),

      buscarFuncionariosPorEquipe: this.trpcService.protectedProcedure
        .input(z.object({ equipeId: z.number() }))
        .query(async ({ input }) => {
          return await this.equipeFuncionariosService.buscarFuncionariosPorEquipe(input.equipeId);
        }),

      buscarEquipesPorFuncionario: this.trpcService.protectedProcedure
        .input(z.object({ funcionarioId: z.string() }))
        .query(async ({ input }) => {
          return await this.equipeFuncionariosService.buscarEquipesPorFuncionario(input.funcionarioId);
        }),

      definirLiderEquipe: this.trpcService.adminProcedure
        .input(z.object({ funcionarioId: z.string(), equipeId: z.number() }))
        .mutation(async ({ input }) => {
          return await this.equipeFuncionariosService.definirLiderEquipe(input.funcionarioId, input.equipeId);
        }),

      removerFuncionarioDaEquipe: this.trpcService.adminProcedure
        .input(z.object({ funcionarioId: z.string(), equipeId: z.number() }))
        .mutation(async ({ input }) => {
          await this.equipeFuncionariosService.removerFuncionarioDaEquipe(input.funcionarioId, input.equipeId);
          return { message: 'Funcionário removido da equipe com sucesso' };
        }),

      // ============ AVALIAÇÕES EXPERIÊNCIA ============
      criarAvaliacaoExperiencia: this.trpcService.adminProcedure
        .input(criarAvaliacaoExperienciaSchema)
        .mutation(async ({ input, ctx }) => {
          const userId = ctx.user?.id;
          if (!userId) throw new Error('Usuário não autenticado');

          return await this.avaliacoesExperienciaService.criarAvaliacaoExperiencia({
            ...input,
            avaliadorId: userId,
          });
        }),

      listarAvaliacoesExperiencia: this.trpcService.protectedProcedure
        .input(
          z.object({
            funcionarioId: z.number().optional(),
            avaliadorId: z.number().optional(),
            tipo: z.enum(tipoAvaliacaoExperienciaEnum).optional(),
            recomendacao: z.enum(recomendacaoAvaliacaoEnum).optional(),
            dataInicial: z.string().optional(),
            dataFinal: z.string().optional(),
            pagina: z.number().min(1).optional(),
            limite: z.number().min(1).max(100).optional(),
          }),
        )
        .query(async ({ input }) => {
          const filtros = {
            ...input,
            pagina: input.pagina ?? 1,
            limite: input.limite ?? 20,
          };
          return await this.avaliacoesExperienciaService.listarAvaliacoesExperiencia(filtros);
        }),

      buscarAvaliacaoExperiencia: this.trpcService.protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const avaliacao = await this.avaliacoesExperienciaService.buscarAvaliacaoExperienciaPorId(input.id);
          if (!avaliacao) throw new Error('Avaliação não encontrada');
          return avaliacao;
        }),

      buscarAvaliacoesPorFuncionario: this.trpcService.protectedProcedure
        .input(z.object({ funcionarioId: z.number() }))
        .query(async ({ input }) => {
          return await this.avaliacoesExperienciaService.buscarAvaliacoesPorFuncionario(input.funcionarioId);
        }),

      // ============ AVALIAÇÕES PERIÓDICAS ============
      criarAvaliacaoPeriodica: this.trpcService.adminProcedure
        .input(criarAvaliacaoPeriodicaSchema)
        .mutation(async ({ input, ctx }) => {
          const userId = ctx.user?.id;
          if (!userId) throw new Error('Usuário não autenticado');

          return await this.avaliacoesPeriodicasService.criarAvaliacaoPeriodica({
            ...input,
            avaliadorId: userId,
          });
        }),

      listarAvaliacoesPeriodicas: this.trpcService.protectedProcedure
        .input(
          z.object({
            funcionarioId: z.number().optional(),
            avaliadorId: z.number().optional(),
            classificacao: z.enum(classificacaoAvaliacaoPeriodicaEnum).optional(),
            periodoInicial: z.string().optional(),
            periodoFinal: z.string().optional(),
            dataInicial: z.string().optional(),
            dataFinal: z.string().optional(),
            pagina: z.number().min(1).optional(),
            limite: z.number().min(1).max(100).optional(),
          }),
        )
        .query(async ({ input }) => {
          const filtros = {
            ...input,
            pagina: input.pagina ?? 1,
            limite: input.limite ?? 20,
          };
          return await this.avaliacoesPeriodicasService.listarAvaliacoesPeriodicas(filtros);
        }),

      buscarAvaliacaoPeriodica: this.trpcService.protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const avaliacao = await this.avaliacoesPeriodicasService.buscarAvaliacaoPeriodicaPorId(input.id);
          if (!avaliacao) throw new Error('Avaliação não encontrada');
          return avaliacao;
        }),

      buscarAvaliacoesPeriodicasPorFuncionario: this.trpcService.protectedProcedure
        .input(z.object({ funcionarioId: z.number() }))
        .query(async ({ input }) => {
          return await this.avaliacoesPeriodicasService.buscarAvaliacoesPorFuncionario(input.funcionarioId);
        }),

      // ============ PONTOWEB INTEGRAÇÃO ============
      pontowebImportarFuncionarios: this.trpcService.adminProcedure
        .input(importarFuncionariosSchema)
        .mutation(async ({ input }) => {
          return await this.pontowebService.importarFuncionariosPontoWeb(input.modoAtualizar);
        }),

      pontowebSincronizarAfastamentos: this.trpcService.adminProcedure
        .input(sincronizarAfastamentosSchema)
        .mutation(async ({ input }) => {
          return await this.pontowebService.sincronizarAfastamentos(input.diasRetroativos);
        }),

      pontowebObterMotivosDemissao: this.trpcService.protectedProcedure.query(async () => {
        return await this.pontowebService.obterMotivosDemissao();
      }),
    });
  }
}

// Export para compatibilidade com código existente
export const rhRouter = {};
