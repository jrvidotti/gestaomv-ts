import z from "zod";

// Schemas para Unidades
export const createUnidadeSchema = z.object({
	nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
	codigo: z
		.number()
		.int()
		.positive("Código deve ser um número positivo inteiro"),
	empresaId: z
		.number()
		.int()
		.positive("ID da empresa deve ser um número positivo")
		.optional(),
	endereco: z.string().optional(),
	cidade: z.string().optional(),
	estado: z.string().optional(),
	telefone: z.string().optional(),
	pontowebId: z
		.number()
		.int()
		.positive("ID do Pontoweb deve ser um número positivo")
		.optional(),
});

export const updateUnidadeSchema = z.object({
	nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
	codigo: z
		.number()
		.int()
		.positive("Código deve ser um número positivo inteiro")
		.optional(),
	empresaId: z
		.number()
		.int()
		.positive("ID da empresa deve ser um número positivo")
		.optional()
		.nullable(),
	endereco: z.string().optional(),
	cidade: z.string().optional(),
	estado: z.string().optional(),
	telefone: z.string().optional(),
	pontowebId: z
		.number()
		.int()
		.positive("ID do Pontoweb deve ser um número positivo")
		.optional(),
});

export type CreateUnidadeDto = z.infer<typeof createUnidadeSchema>;
export type UpdateUnidadeDto = z.infer<typeof updateUnidadeSchema>;
