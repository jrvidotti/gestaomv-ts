import { z } from "zod";

export const createCarteiraSchema = z.object({
	nome: z.string(),
	banco: z.string().optional(),
	agencia: z.string().optional(),
	conta: z.string().optional(),
	chavePix: z.string().optional(),
});

export const updateCarteiraSchema = createCarteiraSchema.partial().extend({
	id: z.number().positive(),
});

export const findCarteiraSchema = z.object({
	id: z.number().positive(),
});

export const listCarteirasSchema = z.object({
	page: z.number().positive().default(1),
	limit: z.number().min(1).max(100).default(20),
	search: z.string().optional(),
	usuarioId: z.number().positive().optional(),
});

// Tipos
export type CreateCarteiraDto = z.infer<typeof createCarteiraSchema>;
export type UpdateCarteiraDto = z.infer<typeof updateCarteiraSchema>;
export type FindCarteiraDto = z.infer<typeof findCarteiraSchema>;
export type ListCarteirasDto = z.infer<typeof listCarteirasSchema>;
