import { authRouter } from "@/modules/core/routers/auth.router";
import { configuracoesRouter } from "@/modules/core/routers/configuracoes.router";
import { superadminRouter } from "@/modules/core/routers/superadmin.router";
import { usersRouter } from "@/modules/core/routers/users.router";
import type { TRPCRouterRecord } from "@trpc/server";

export const coreRouter = {
	auth: authRouter,
	configuracoes: configuracoesRouter,
	superadmin: superadminRouter,
	users: usersRouter,
} satisfies TRPCRouterRecord;
