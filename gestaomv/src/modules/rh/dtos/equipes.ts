import z from "zod";

export const criarEquipeSchema = z.object({
	nome: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(100, "Nome deve ter no máximo 100 caracteres"),
	codigo: z
		.string()
		.min(1, "Código é obrigatório")
		.max(20, "Código deve ter no máximo 20 caracteres"),
});

export const atualizarEquipeSchema = criarEquipeSchema.partial();

export const filtrosEquipesSchema = z.object({
	busca: z.string().optional(),
	pagina: z.number().min(1, "Página deve ser maior que 0").default(1),
	limite: z
		.number()
		.min(1, "Limite deve ser maior que 0")
		.max(100, "Limite máximo é 100")
		.default(20),
});

// Equipes
export type CriarEquipeData = z.infer<typeof criarEquipeSchema>;
export type AtualizarEquipeData = z.infer<typeof atualizarEquipeSchema>;
export type FiltrosEquipes = z.infer<typeof filtrosEquipesSchema>;
