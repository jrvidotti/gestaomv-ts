import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
	createCarteiraSchema,
	findCarteiraSchema,
	listCarteirasSchema,
	updateCarteiraSchema,
} from "../dtos";
import { carteirasService } from "../services";

export const carteirasRouter = createTRPCRouter({
	create: protectedProcedure
		.input(createCarteiraSchema)
		.mutation(async ({ input, ctx }) => {
			return carteirasService.create(input, ctx.user.id);
		}),

	findById: protectedProcedure
		.input(findCarteiraSchema)
		.query(async ({ input, ctx }) => {
			return carteirasService.findById(input, ctx.user.id);
		}),

	list: protectedProcedure
		.input(listCarteirasSchema)
		.query(async ({ input, ctx }) => {
			return carteirasService.list(input, ctx.user.id);
		}),

	update: protectedProcedure
		.input(updateCarteiraSchema)
		.mutation(async ({ input, ctx }) => {
			return carteirasService.update(input, ctx.user.id);
		}),

	delete: protectedProcedure
		.input(findCarteiraSchema)
		.mutation(async ({ input, ctx }) => {
			return carteirasService.delete(input, ctx.user.id);
		}),

	listByUser: protectedProcedure.query(async ({ ctx }) => {
		return carteirasService.listByUser(ctx.user.id);
	}),
});
