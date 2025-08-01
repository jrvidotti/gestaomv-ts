import { materiaisRouter } from "@/modules/almoxarifado/routers/materiais.router";
import { solicitacoesRouter } from "@/modules/almoxarifado/routers/solicitacoes.router";
import { statsRouter } from "@/modules/almoxarifado/routers/stats.router";
import type { TRPCRouterRecord } from "@trpc/server";

export const almoxarifadoRouter = {
	materiais: materiaisRouter,
	solicitacoes: solicitacoesRouter,
	stats: statsRouter,
} satisfies TRPCRouterRecord;
