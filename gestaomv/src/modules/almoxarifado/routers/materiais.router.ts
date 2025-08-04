import { adminProcedure, protectedProcedure } from "@/integrations/trpc/init";
import {
	atualizarMaterialSchema,
	criarMaterialSchema,
	filtroMateriaisSchema,
} from "@/modules/almoxarifado/dtos";
import { MateriaisService } from "@/modules/almoxarifado/services/materiais.service";
import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

const materiaisService = new MateriaisService();

export const materiaisRouter = {
	criar: adminProcedure
		.input(criarMaterialSchema)
		.mutation(async ({ input }) => {
			return await materiaisService.criarMaterial(input);
		}),

	listar: protectedProcedure
		.input(filtroMateriaisSchema)
		.query(async ({ input }) => {
			const filtros = {
				...input,
				pagina: input.pagina ?? 1,
				limite: input.limite ?? 20,
			};
			return await materiaisService.listarMateriais(filtros);
		}),

	buscar: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input }) => {
			const material = await materiaisService.buscarMaterialPorId(input.id);
			if (!material) {
				throw new Error("Material não encontrado");
			}
			return material;
		}),

	atualizar: adminProcedure
		.input(
			z.object({
				id: z.number(),
				data: atualizarMaterialSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const material = await materiaisService.atualizarMaterial(
				input.id,
				input.data,
			);
			if (!material) {
				throw new Error("Material não encontrado");
			}
			return material;
		}),

	inativar: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			await materiaisService.inativarMaterial(input.id);
			return { message: "Material inativado com sucesso" };
		}),

	listarTiposMaterial: protectedProcedure.query(async () => {
		return await materiaisService.listarTiposMaterial();
	}),

	listarUnidadesMedida: protectedProcedure.query(async () => {
		return await materiaisService.listarUnidadesMedida();
	}),

	deletarFoto: adminProcedure
		.input(
			z.object({
				materialId: z.number(),
				urlFoto: z.url(),
			}),
		)
		.mutation(async ({ input }) => {
			await materiaisService.deletarFotoMaterial(
				input.materialId,
				input.urlFoto,
			);
			return { message: "Foto do material deletada com sucesso" };
		}),
} satisfies TRPCRouterRecord;
