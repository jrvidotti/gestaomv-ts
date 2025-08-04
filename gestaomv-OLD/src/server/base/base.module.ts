import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { EmpresasService } from './empresas.service';
import { UnidadesService } from './unidades.service';
import { ConfiguracoesService } from './configuracoes.service';
import { BaseRouter } from './base.router';

@Module({
  providers: [UsersService, EmpresasService, UnidadesService, ConfiguracoesService, BaseRouter],
  exports: [UsersService, EmpresasService, UnidadesService, ConfiguracoesService, BaseRouter],
})
export class BaseModule {}
