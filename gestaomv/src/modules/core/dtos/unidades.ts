import z from "zod";

export const createEmpresaSchema = z.object({
	razaoSocial: z
		.string()
		.min(2, "Razão Social deve ter pelo menos 2 caracteres"),
	nomeFantasia: z.string().optional(),
	cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos").max(18, "CNPJ inválido"),
	pontowebId: z
		.number()
		.int()
		.positive("ID do Pontoweb deve ser um número positivo")
		.optional(),
});

export const updateEmpresaSchema = z.object({
	razaoSocial: z
		.string()
		.min(2, "Razão Social deve ter pelo menos 2 caracteres")
		.optional(),
	nomeFantasia: z.string().optional(),
	cnpj: z
		.string()
		.min(14, "CNPJ deve ter 14 dígitos")
		.max(18, "CNPJ inválido")
		.optional(),
	pontowebId: z
		.number()
		.int()
		.positive("ID do Pontoweb deve ser um número positivo")
		.optional(),
});

export type CreateEmpresaDto = z.infer<typeof createEmpresaSchema>;
export type UpdateEmpresaDto = z.infer<typeof updateEmpresaSchema>;
