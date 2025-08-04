import { avaliacoesExperienciaRouter } from "@/modules/rh/routers/avaliacoes-experiencia.router";
import { avaliacoesPeriodicasRouter } from "@/modules/rh/routers/avaliacoes-periodicas.router";
import { cargosRouter } from "@/modules/rh/routers/cargos.router";
import { departamentosRouter } from "@/modules/rh/routers/departamentos.router";
import { equipesRouter } from "@/modules/rh/routers/equipes.router";
import { funcionariosRouter } from "@/modules/rh/routers/funcionarios.router";
import { pontowebRouter } from "@/modules/rh/routers/pontoweb.router";
import type { TRPCRouterRecord } from "@trpc/server";

export const rhRouter = {
	departamentos: departamentosRouter,
	equipes: equipesRouter,
	cargos: cargosRouter,
	funcionarios: funcionariosRouter,
	avaliacoesExperiencia: avaliacoesExperienciaRouter,
	avaliacoesPeriodicas: avaliacoesPeriodicasRouter,
	pontoweb: pontowebRouter,
} satisfies TRPCRouterRecord;
