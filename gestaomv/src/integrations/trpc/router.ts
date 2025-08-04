import { almoxarifadoRouter } from "@/modules/almoxarifado/routers";
import { coreRouter } from "@/modules/core/routers/core.router";
import { rhRouter } from "@/modules/rh/routers";
import { createTRPCRouter } from "./init";

export const trpcRouter = createTRPCRouter({
	...coreRouter,
	rh: rhRouter,
	almoxarifado: almoxarifadoRouter,
});

export type TRPCRouter = typeof trpcRouter;
