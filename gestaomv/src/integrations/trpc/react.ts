import type { TRPCRouter } from "@/integrations/trpc/router";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<TRPCRouter>();
