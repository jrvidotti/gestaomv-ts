import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "./init";

import guitars from "@/data/example-guitars";
import { env } from "@/env";
import type { TRPCRouterRecord } from "@trpc/server";

const todos = [
	{ id: 1, name: "Get groceries" },
	{ id: 2, name: "Buy a new phone" },
	{ id: 3, name: "Finish the project" },
];

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

const guitarsRouter = {
	list: publicProcedure.query(() => {
		console.log("SERVER_URL", env.SERVER_URL);
		return guitars;
	}),
} satisfies TRPCRouterRecord;

const authRouter = {
	me: protectedProcedure.query(({ ctx }) => {
		return {
			id: ctx.user.id,
			email: ctx.user.email,
			roles: ctx.user.roles,
		};
	}),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
	todos: todosRouter,
	guitars: guitarsRouter,
	auth: authRouter,
});
export type TRPCRouter = typeof trpcRouter;
