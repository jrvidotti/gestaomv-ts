import type { TRPCRouter } from "@/trpc/router";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<TRPCRouter>();
