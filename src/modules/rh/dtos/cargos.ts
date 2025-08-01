import z from "zod";

export const criarCargoSchema = z.object({
	nome: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(100, "Nome deve ter no máximo 100 caracteres"),
	descricao: z
		.string()
		.max(500, "Descrição deve ter no máximo 500 caracteres")
		.optional(),
	departamentoId: z.number().min(1, "Departamento é obrigatório"),
	pontowebId: z.number().min(1).optional(),
});

export const atualizarCargoSchema = criarCargoSchema.partial();

export const filtrosCargosSchema = z.object({
	busca: z.string().optional(),
	departamentoId: z.number().min(1).optional(),
	pagina: z.number().min(1, "Página deve ser maior que 0").default(1),
	limite: z
		.number()
		.min(1, "Limite deve ser maior que 0")
		.max(100, "Limite máximo é 100")
		.default(20),
});

// Cargos
export type CriarCargoData = z.infer<typeof criarCargoSchema>;
export type AtualizarCargoData = z.infer<typeof atualizarCargoSchema>;
export type FiltrosCargos = z.infer<typeof filtrosCargosSchema>;
