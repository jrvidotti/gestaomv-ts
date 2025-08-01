import { tagoneLoginSchema } from "@/shared";
import { TagoneService } from "../tagone.service";
import { protectedProcedure, t } from "../trpc/context";

const tagoneService = new TagoneService();

export const tagoneRouter = t.router({
	login: protectedProcedure
		.input(tagoneLoginSchema)
		.mutation(async ({ input, ctx }) => {
			return tagoneService.loginAndSaveTagOne(ctx.user.id, input);
		}),

	getStatus: protectedProcedure.query(async ({ ctx }) => {
		return tagoneService.getTagOneStatus(ctx.user.id);
	}),

	logout: protectedProcedure.mutation(async ({ ctx }) => {
		return tagoneService.logoutTagOne(ctx.user.id);
	}),

	getUserTagOne: protectedProcedure.query(async ({ ctx }) => {
		return tagoneService.getUserTagOne(ctx.user.id);
	}),
});
