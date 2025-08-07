import { db } from "@/db";
import { env } from "@/env";
import { empresasService, unidadesService } from "@/modules/core/services";
import { AvaliacoesExperienciaService } from "./avaliacoes-experiencia.service";
import { AvaliacoesPeriodicasService } from "./avaliacoes-periodicas.service";
import { CargosService } from "./cargos.service";
import { DepartamentosService } from "./departamentos.service";
import { EquipeFuncionariosService } from "./equipe-funcionarios.service";
import { EquipesService } from "./equipes.service";
import { FuncionariosService } from "./funcionarios.service";
import { PontowebService } from "./pontoweb.service";
import { UserFuncionariosService } from "./user-funcionarios.service";

export const departamentosService = new DepartamentosService(db);
export const equipesService = new EquipesService(db);
export const cargosService = new CargosService(db);
export const equipeFuncionariosService = new EquipeFuncionariosService(db);
export const funcionariosService = new FuncionariosService(db);
export const userFuncionariosService = new UserFuncionariosService(db);
export const avaliacoesPeriodicasService = new AvaliacoesPeriodicasService(db);
export const avaliacoesExperienciaService = new AvaliacoesExperienciaService(
	db,
);

export const pontowebService = new PontowebService(
	empresasService,
	unidadesService,
	departamentosService,
	cargosService,
	funcionariosService,
	env.PONTOWEB_USER,
	env.PONTOWEB_PASS,
);
