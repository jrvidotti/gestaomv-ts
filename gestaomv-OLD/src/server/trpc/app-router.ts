/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrpcService } from './trpc.service';
import { AuthService } from '../auth/auth.service';
import { AuthRouter } from '../auth/auth.router';
import { BaseRouter } from '../base/base.router';
import { TagoneRouter } from '../tagone/tagone.router';
import { AlmoxarifadoRouter } from '../almoxarifado/almoxarifado.router';
import { RhRouter } from '../rh/rh.router';
import { UsersService } from '../base/users.service';
import { EmpresasService } from '../base/empresas.service';
import { UnidadesService } from '../base/unidades.service';
import { ConfiguracoesService } from '../base/configuracoes.service';
import { JwtService } from '@nestjs/jwt';
import { TagoneService } from '../tagone/tagone.service';
import { MateriaisService } from '../almoxarifado/materiais.service';
import { SolicitacoesService } from '../almoxarifado/solicitacoes.service';
import { EstatisticasService } from '../almoxarifado/estatisticas.service';
import { FuncionariosService } from '../rh/funcionarios.service';
import { DepartamentosService } from '../rh/departamentos.service';
import { CargosService } from '../rh/cargos.service';
import { EquipesService } from '../rh/equipes.service';
import { EquipeFuncionariosService } from '../rh/equipe-funcionarios.service';
import { UserFuncionariosService } from '../rh/user-funcionarios.service';
import { AvaliacoesExperienciaService } from '../rh/avaliacoes-experiencia.service';
import { AvaliacoesPeriodicasService } from '../rh/avaliacoes-periodicas.service';
import { TrpcRouter } from './trpc.router';

// Cache do router
let cachedRouter: any = null;

// Função para criar instâncias dos services manualmente
const createServices = () => {
  // Criar JwtService
  const jwtService = new JwtService({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    signOptions: { expiresIn: '24h' },
  });

  // Services base
  const usersService = new UsersService();
  const empresasService = new EmpresasService();
  const unidadesService = new UnidadesService();
  const configuracoesService = new ConfiguracoesService();

  // Auth service
  const authService = new AuthService();

  // tRPC service
  const trpcService = new TrpcService(authService, jwtService);

  // Tagone service
  const tagoneService = new TagoneService();

  // Almoxarifado services
  const materiaisService = new MateriaisService();
  const solicitacoesService = new SolicitacoesService();
  const estatisticasService = new EstatisticasService();

  // RH services
  const funcionariosService = new FuncionariosService();
  const departamentosService = new DepartamentosService();
  const cargosService = new CargosService();
  const equipesService = new EquipesService();
  const equipeFuncionariosService = new EquipeFuncionariosService();
  const userFuncionariosService = new UserFuncionariosService();
  const avaliacoesExperienciaService = new AvaliacoesExperienciaService();
  const avaliacoesPeriodicasService = new AvaliacoesPeriodicasService();

  // Routers
  const authRouter = new AuthRouter(trpcService, authService, usersService);
  const baseRouter = new BaseRouter(trpcService, usersService, empresasService, unidadesService, configuracoesService);
  const tagoneRouter = new TagoneRouter(trpcService, tagoneService);
  const almoxarifadoRouter = new AlmoxarifadoRouter(
    trpcService,
    materiaisService,
    solicitacoesService,
    estatisticasService,
  );
  const rhRouter = new RhRouter(
    trpcService,
    equipesService,
    departamentosService,
    cargosService,
    funcionariosService,
    userFuncionariosService,
    equipeFuncionariosService,
    avaliacoesExperienciaService,
    avaliacoesPeriodicasService,
    empresasService,
    unidadesService,
  );

  // Main router
  const trpcRouter = new TrpcRouter(trpcService, authRouter, baseRouter, tagoneRouter, almoxarifadoRouter, rhRouter);

  return trpcRouter.appRouter;
};

// Função para obter o app router
export const getAppRouter = async () => {
  if (cachedRouter) {
    return cachedRouter;
  }

  try {
    console.log('[AppRouter] Inicializando tRPC Router...');
    cachedRouter = createServices();
    console.log('[AppRouter] tRPC Router inicializado com sucesso');
    return cachedRouter;
  } catch (error) {
    console.error('[AppRouter] Erro ao inicializar:', error);
    throw error;
  }
};

// Tipo exportado para inferência no frontend
export type AppRouter = ReturnType<TrpcRouter['criarRouter']>;
