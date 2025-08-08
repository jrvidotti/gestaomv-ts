import { createTRPCRouter } from "@/trpc/init";
import { anexosRouter } from "./anexos";
import { carteirasRouter } from "./carteiras";
import { clientesRouter } from "./clientes";
import { documentosRouter } from "./documentos";
import { lancamentosRouter } from "./lancamentos";
import { operacoesRouter } from "./operacoes";
import { pessoasRouter } from "./pessoas";
import { relatoriosRouter } from "./relatorios";

export const factoringRouter = createTRPCRouter({
	carteiras: carteirasRouter,
	pessoas: pessoasRouter,
	clientes: clientesRouter,
	operacoes: operacoesRouter,
	documentos: documentosRouter,
	lancamentos: lancamentosRouter,
	relatorios: relatoriosRouter,
	anexos: anexosRouter,
});

export type FactoringRouter = typeof factoringRouter;
