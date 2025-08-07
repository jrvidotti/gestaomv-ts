import { ALL_ROLES } from "@/constants";
import {
	createAdminSchema,
	seedOperationSchema,
} from "@/modules/core/dtos/superadmin";
import { superadminService } from "@/modules/core/services";
import { createRoleProcedure } from "@/trpc/init";
import type { TRPCRouterRecord } from "@trpc/server";

const superadminProcedure = createRoleProcedure([ALL_ROLES.SUPERADMIN]);

export const superadminRouter = {
	buscarStatsSistema: superadminProcedure.query(async () => {
		return await superadminService.buscarStatsSistema();
	}),

	buscarInfoSistema: superadminProcedure.query(async () => {
		return await superadminService.buscarInfoSistema();
	}),

	buscarInfoMigracoes: superadminProcedure.query(async () => {
		return await superadminService.buscarInfoMigracoes();
	}),

	executarMigracoes: superadminProcedure.mutation(async () => {
		const result = await superadminService.executarMigracoes();
		return {
			...result,
			timestamp: new Date().toISOString(),
		};
	}),

	operacaoSeed: superadminProcedure
		.input(seedOperationSchema)
		.mutation(async ({ input }) => {
			return await superadminService.operacaoSeed(input.operation);
		}),

	criarAdmin: superadminProcedure
		.input(createAdminSchema)
		.mutation(async ({ input }) => {
			return await superadminService.criarAdmin(input);
		}),
} satisfies TRPCRouterRecord;
