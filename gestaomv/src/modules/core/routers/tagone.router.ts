import { protectedProcedure } from "@/integrations/trpc/init";
import { tagoneLoginSchema } from "@/modules/core/dtos";
import { tagoneService } from "@/modules/core/services/tagone.service";
import type { TRPCRouterRecord } from "@trpc/server";

export const tagoneRouter = {
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
} satisfies TRPCRouterRecord;
