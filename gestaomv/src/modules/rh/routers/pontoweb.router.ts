import { adminProcedure, protectedProcedure } from "@/integrations/trpc/init";
import {
	importarFuncionariosSchema,
	sincronizarAfastamentosSchema,
} from "@/modules/core/dtos";
import { EmpresasService } from "@/modules/core/services/empresas.service";
import { UnidadesService } from "@/modules/core/services/unidades.service";
import { CargosService } from "@/modules/rh/services/cargos.service";
import { DepartamentosService } from "@/modules/rh/services/departamentos.service";
import { FuncionariosService } from "@/modules/rh/services/funcionarios.service";
import { PontowebService } from "@/modules/rh/services/pontoweb.service";
import type { TRPCRouterRecord } from "@trpc/server";

const funcionariosService = new FuncionariosService();
const departamentosService = new DepartamentosService();
const cargosService = new CargosService();
const empresasService = new EmpresasService();
const unidadesService = new UnidadesService();

const pontowebService = new PontowebService(
	funcionariosService,
	departamentosService,
	cargosService,
	empresasService,
	unidadesService,
);

export const pontowebRouter = {
	importarFuncionarios: adminProcedure
		.input(importarFuncionariosSchema)
		.mutation(async ({ input }) => {
			return await pontowebService.importarFuncionariosPontoWeb(
				input.modoAtualizar,
			);
		}),

	sincronizarAfastamentos: adminProcedure
		.input(sincronizarAfastamentosSchema)
		.mutation(async ({ input }) => {
			return await pontowebService.sincronizarAfastamentos(
				input.diasRetroativos,
			);
		}),

	obterMotivosDemissao: protectedProcedure.query(async () => {
		return await pontowebService.obterMotivosDemissao();
	}),
} satisfies TRPCRouterRecord;