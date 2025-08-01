import type { TRPCRouterRecord } from "@trpc/server";
import { avaliacoesExperienciaRouter } from "./avaliacoes-experiencia.router";
import { avaliacoesPeriodicasRouter } from "./avaliacoes-periodicas.router";
import { cargosRouter } from "./cargos.router";
import { departamentosRouter } from "./departamentos.router";
import { equipesRouter } from "./equipes.router";
import { funcionariosRouter } from "./funcionarios.router";
import { pontowebRouter } from "./pontoweb.router";

export const rhRouter = {
	departamentos: departamentosRouter,
	equipes: equipesRouter,
	cargos: cargosRouter,
	funcionarios: funcionariosRouter,
	avaliacoesExperiencia: avaliacoesExperienciaRouter,
	avaliacoesPeriodicas: avaliacoesPeriodicasRouter,
	pontoweb: pontowebRouter,
} satisfies TRPCRouterRecord;
