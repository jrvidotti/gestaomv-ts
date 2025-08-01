import guitars from "@/data/example-guitars";
import { env } from "@/env";
import { authRouter } from "@/modules/core/routers/auth.router";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./init";

// remover
const todos = [
	{ id: 1, name: "Get groceries" },
	{ id: 2, name: "Buy a new phone" },
	{ id: 3, name: "Finish the project" },
];

// remover
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

// remover
const guitarsRouter = {
	list: publicProcedure.query(() => {
		console.log("SERVER_URL", env.SERVER_URL);
		return guitars;
	}),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
	todos: todosRouter,
	guitars: guitarsRouter,
	auth: authRouter,
});
export type TRPCRouter = typeof trpcRouter;
