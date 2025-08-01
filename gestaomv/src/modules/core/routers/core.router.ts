import { authRouter } from "@/modules/core/routers/auth.router";
import { configuracoesRouter } from "@/modules/core/routers/configuracoes.router";
import { empresasRouter } from "@/modules/core/routers/empresas.router";
import { tagoneRouter } from "@/modules/core/routers/tagone.router";
import { unidadesRouter } from "@/modules/core/routers/unidades.router";
import { usersRouter } from "@/modules/core/routers/users.router";
import type { TRPCRouterRecord } from "@trpc/server";

export const coreRouter = {
	auth: authRouter,
	configuracoes: configuracoesRouter,
	empresas: empresasRouter,
	tagone: tagoneRouter,
	unidades: unidadesRouter,
	users: usersRouter,
} satisfies TRPCRouterRecord;
