import { z } from "zod";
import { periodicidadeEnum, tipoItemChecklistEnum } from "../enums";

// Schemas base
export const tipoItemChecklistSchema = z.enum(tipoItemChecklistEnum);
export const periodicidadeSchema = z.enum(periodicidadeEnum);

// Schema para criar item de checklist
export const createChecklistItemSchema = z.object({
	titulo: z
		.string()
		.min(1, "Título é obrigatório")
		.max(200, "Título muito longo"),
	descricao: z.string().max(500, "Descrição muito longa").optional(),
	tipo: tipoItemChecklistSchema,
	obrigatorio: z.boolean().default(true),
	peso: z
		.number()
		.min(0.1, "Peso deve ser maior que 0")
		.max(10, "Peso deve ser menor ou igual a 10")
		.default(1),
	ordem: z.number().int().min(1, "Ordem deve ser maior que 0"),
});

// Schema para criar template de checklist
export const createChecklistTemplateSchema = z.object({
	nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
	descricao: z.string().max(500, "Descrição muito longa").optional(),
	periodicidade: periodicidadeSchema,
	ativo: z.boolean().default(true),
	itens: z
		.array(createChecklistItemSchema)
		.min(1, "Template deve ter pelo menos um item"),
});

// Schema para atualizar template
export const updateChecklistTemplateSchema =
	createChecklistTemplateSchema.partial();

// Schema para atualizar item
export const updateChecklistItemSchema = createChecklistItemSchema.partial();

// Schema para listar templates
export const listChecklistTemplatesSchema = z.object({
	nome: z.string().optional(),
	ativo: z.boolean().optional(),
	periodicidade: periodicidadeSchema.optional(),
	pagina: z.number().int().min(1).default(1),
	limite: z.number().int().min(1).max(100).default(20),
});

// Schema para buscar template por ID
export const getChecklistTemplateSchema = z.object({
	id: z.number().int().positive("ID deve ser um número positivo"),
});

// Schema para deletar template
export const deleteChecklistTemplateSchema = z.object({
	id: z.number().int().positive("ID deve ser um número positivo"),
});

// Schema para reordenar itens
export const reorderItemsSchema = z.object({
	templateId: z.number().int().positive(),
	itens: z.array(
		z.object({
			id: z.number().int().positive(),
			ordem: z.number().int().min(1),
		}),
	),
});
