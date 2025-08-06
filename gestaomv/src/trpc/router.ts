import { almoxarifadoRouter } from "@/modules/almoxarifado/routers";
import { checklistRouter } from "@/modules/checklist/routers";
import { coreRouter } from "@/modules/core/routers";
import { rhRouter } from "@/modules/rh/routers";
import { createTRPCRouter } from "./init";

export const trpcRouter = createTRPCRouter({
	...coreRouter,
	rh: rhRouter,
	almoxarifado: almoxarifadoRouter,
	checklist: checklistRouter,
});

export type TRPCRouter = typeof trpcRouter;
