import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/trpc/init";
import {
	createChecklistItemSchema,
	createChecklistTemplateSchema,
	deleteChecklistTemplateSchema,
	getChecklistTemplateSchema,
	listChecklistTemplatesSchema,
	reorderItemsSchema,
	updateChecklistItemSchema,
	updateChecklistTemplateSchema,
} from "../dtos/templates";
import { templatesService } from "../services";

export const templatesRouter = createTRPCRouter({
	// Listar templates (protegido - qualquer usuário autenticado)
	listar: protectedProcedure
		.input(listChecklistTemplatesSchema)
		.query(async ({ input }) => {
			return await templatesService.listar(input);
		}),

	// Buscar template por ID (protegido)
	buscar: protectedProcedure
		.input(getChecklistTemplateSchema)
		.query(async ({ input }) => {
			const template = await templatesService.buscar(input.id);

			if (!template) {
				throw new Error("Template não encontrado");
			}

			return template;
		}),

	// Criar template (admin)
	criar: adminProcedure
		.input(createChecklistTemplateSchema)
		.mutation(async ({ input, ctx }) => {
			return await templatesService.criar(input, ctx.user.id);
		}),

	// Atualizar template (admin)
	atualizar: adminProcedure
		.input(
			updateChecklistTemplateSchema.extend({
				id: getChecklistTemplateSchema.shape.id,
			}),
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			const template = await templatesService.atualizar(id, data);

			if (!template) {
				throw new Error("Template não encontrado");
			}

			return template;
		}),

	// Deletar template (admin)
	deletar: adminProcedure
		.input(deleteChecklistTemplateSchema)
		.mutation(async ({ input }) => {
			const success = await templatesService.deletar(input.id);

			if (!success) {
				throw new Error("Falha ao deletar template");
			}

			return { success: true };
		}),

	// Adicionar item ao template (admin)
	adicionarItem: adminProcedure
		.input(
			createChecklistItemSchema.extend({
				templateId: getChecklistTemplateSchema.shape.id,
			}),
		)
		.mutation(async ({ input }) => {
			const { templateId, ...itemData } = input;
			return await templatesService.adicionarItem(templateId, itemData);
		}),

	// Atualizar item (admin)
	atualizarItem: adminProcedure
		.input(
			updateChecklistItemSchema.extend({
				id: getChecklistTemplateSchema.shape.id,
			}),
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			const item = await templatesService.atualizarItem(id, data);

			if (!item) {
				throw new Error("Item não encontrado");
			}

			return item;
		}),

	// Deletar item (admin)
	deletarItem: adminProcedure
		.input(deleteChecklistTemplateSchema)
		.mutation(async ({ input }) => {
			const success = await templatesService.deletarItem(input.id);

			if (!success) {
				throw new Error("Falha ao deletar item");
			}

			return { success: true };
		}),

	// Reordenar itens (admin)
	reordenarItens: adminProcedure
		.input(reorderItemsSchema)
		.mutation(async ({ input }) => {
			const success = await templatesService.reordenarItens(
				input.templateId,
				input.itens,
			);

			return { success };
		}),
});
