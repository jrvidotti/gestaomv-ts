import { Module } from '@nestjs/common';
import { EquipesService } from './equipes.service';
import { DepartamentosService } from './departamentos.service';
import { CargosService } from './cargos.service';
import { FuncionariosService } from './funcionarios.service';
import { UserFuncionariosService } from './user-funcionarios.service';
import { EquipeFuncionariosService } from './equipe-funcionarios.service';
import { AvaliacoesExperienciaService } from './avaliacoes-experiencia.service';
import { AvaliacoesPeriodicasService } from './avaliacoes-periodicas.service';
import { RhRouter } from './rh.router';

@Module({
  imports: [],
  providers: [
    EquipesService,
    DepartamentosService,
    CargosService,
    FuncionariosService,
    UserFuncionariosService,
    EquipeFuncionariosService,
    AvaliacoesExperienciaService,
    AvaliacoesPeriodicasService,
    RhRouter,
  ],
  exports: [
    EquipesService,
    DepartamentosService,
    CargosService,
    FuncionariosService,
    UserFuncionariosService,
    EquipeFuncionariosService,
    AvaliacoesExperienciaService,
    AvaliacoesPeriodicasService,
    RhRouter,
  ],
})
export class RhModule {}
