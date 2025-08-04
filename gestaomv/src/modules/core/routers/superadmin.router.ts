import { createRoleProcedure } from "@/integrations/trpc/init";
import {
	createAdminSchema,
	seedOperationSchema,
} from "@/modules/core/dtos/superadmin";
import { USER_ROLES } from "@/modules/core/enums";
import { SuperadminService } from "@/modules/core/services/superadmin.service";
import type { TRPCRouterRecord } from "@trpc/server";

const superadminService = new SuperadminService();

const superadminProcedure = createRoleProcedure([USER_ROLES.SUPERADMIN]);

export const superadminRouter = {
	getStats: superadminProcedure.query(async () => {
		return await superadminService.getSystemStats();
	}),

	getSystemInfo: superadminProcedure.query(async () => {
		return await superadminService.getSystemInfo();
	}),

	getMigrationInfo: superadminProcedure.query(async () => {
		return await superadminService.getMigrationInfo();
	}),

	runMigrations: superadminProcedure.mutation(async () => {
		const result = await superadminService.runMigrations();
		return {
			...result,
			timestamp: new Date().toISOString(),
		};
	}),

	seedOperation: superadminProcedure
		.input(seedOperationSchema)
		.mutation(async ({ input }) => {
			return await superadminService.seedOperation(input.operation);
		}),

	createAdmin: superadminProcedure
		.input(createAdminSchema)
		.mutation(async ({ input }) => {
			return await superadminService.createAdmin(input);
		}),
} satisfies TRPCRouterRecord;
