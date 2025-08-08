import { createTRPCRouter } from "@/trpc/init";
import { carteirasRouter } from "./carteiras";
import { pessoasRouter } from "./pessoas";
import { clientesRouter } from "./clientes";
import { operacoesRouter } from "./operacoes";
import { documentosRouter } from "./documentos";
import { lancamentosRouter } from "./lancamentos";
import { relatoriosRouter } from "./relatorios";

export const factoringRouter = createTRPCRouter({
  carteiras: carteirasRouter,
  pessoas: pessoasRouter,
  clientes: clientesRouter,
  operacoes: operacoesRouter,
  documentos: documentosRouter,
  lancamentos: lancamentosRouter,
  relatorios: relatoriosRouter,
});

export type FactoringRouter = typeof factoringRouter;
