import guitars from "@/data/example-guitars";
import { env } from "@/env";
import { authRouter } from "@/modules/core/routers/auth.router";
import { configuracoesRouter } from "@/modules/core/routers/configuracoes.router";
import { empresasRouter } from "@/modules/core/routers/empresas.router";
import { tagoneRouter } from "@/modules/core/routers/tagone.router";
import { unidadesRouter } from "@/modules/core/routers/unidades.router";
import { usersRouter } from "@/modules/core/routers/users.router";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./init";

// demo
const todos = [
	{ id: 1, name: "Get groceries" },
	{ id: 2, name: "Buy a new phone" },
	{ id: 3, name: "Finish the project" },
];

// demo
const todosRouter = {
	list: publicProcedure.query(() => todos),
	add: publicProcedure
		.input(z.object({ name: z.string() }))
		.mutation(({ input }) => {
			const newTodo = { id: todos.length + 1, name: input.name };
			todos.push(newTodo);
			return newTodo;
		}),
} satisfies TRPCRouterRecord;

// demo
const guitarsRouter = {
	list: publicProcedure.query(() => {
		console.log("SERVER_URL", env.SERVER_URL);
		return guitars;
	}),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
	// demo routers
	todos: todosRouter,
	guitars: guitarsRouter,

	// core routers
	auth: authRouter,
	tagone: tagoneRouter,
	configuracoes: configuracoesRouter,
	users: usersRouter,
	unidades: unidadesRouter,
	empresas: empresasRouter,
});

export type TRPCRouter = typeof trpcRouter;
