import { createTRPCRouter } from "@/trpc/init";
import { calculosRouter } from "./calculos.router";
import { carteirasRouter } from "./carteiras.router";
import { clientesRouter } from "./clientes.router";
import { pessoasRouter } from "./pessoas.router";

export const factoringRouter = createTRPCRouter({
	pessoas: pessoasRouter,
	clientes: clientesRouter,
	carteiras: carteirasRouter,
	calculos: calculosRouter,
});

export type FactoringRouter = typeof factoringRouter;
