import guitars from "@/data/example-guitars";
import { env } from "@/env";
import { almoxarifadoRouter } from "@/modules/almoxarifado/routers/almoxarifado.router";
import { coreRouter } from "@/modules/core/routers/core.router";
import { rhRouter } from "@/modules/rh/routers/rh.router";
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
	...coreRouter,
	rh: rhRouter,
	almoxarifado: almoxarifadoRouter,

	// demo routers
	todos: todosRouter,
	guitars: guitarsRouter,
});

export type TRPCRouter = typeof trpcRouter;
