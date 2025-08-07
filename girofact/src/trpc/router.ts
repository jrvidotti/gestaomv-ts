import { coreRouter } from "@/modules/core/routers";
import { createTRPCRouter } from "./init";

export const trpcRouter = createTRPCRouter({
  ...coreRouter,
});

export type TRPCRouter = typeof trpcRouter;
