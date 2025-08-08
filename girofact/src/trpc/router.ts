import { consultasRouter } from "@/modules/consultas/routers";
import { coreRouter } from "@/modules/core/routers";
import { factoringRouter } from "@/modules/factoring/routers";
import { createTRPCRouter } from "./init";

export const trpcRouter = createTRPCRouter({
	core: coreRouter,
	factoring: factoringRouter,
	consultas: consultasRouter,
});

export type TRPCRouter = typeof trpcRouter;
