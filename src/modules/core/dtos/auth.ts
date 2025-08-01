import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const tagoneAuthLoginSchema = z.object({
	username: z.string().min(1, "Usuário TagOne é obrigatório"),
	password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type TagOneAuthLoginDto = z.infer<typeof tagoneAuthLoginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
