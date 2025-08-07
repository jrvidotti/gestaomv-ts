import { coreRouter } from "@/modules/core/routers";
import { factoringRouter } from "@/modules/factoring/routers";
import { createTRPCRouter } from "./init";

export const trpcRouter = createTRPCRouter({
	core: coreRouter,
	factoring: factoringRouter,
});

export type TRPCRouter = typeof trpcRouter;
