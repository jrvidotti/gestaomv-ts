import { ALL_ROLES } from "@/constants";
import {
	createAdminSchema,
	seedOperationSchema,
} from "@/modules/core/dtos/superadmin";
import { superadminService } from "@/modules/core/services/superadmin.service";
import { createRoleProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";

const superadminProcedure = createRoleProcedure([ALL_ROLES.SUPERADMIN]);

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
