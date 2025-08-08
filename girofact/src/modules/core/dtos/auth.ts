import type { User } from "@/modules/core/types";
import { z } from "zod";

export const emailLoginSchema = z.object({
	email: z.email("Email inválido"),
	password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
	email: z.email("Email inválido"),
	password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

export type EmailLoginDto = z.infer<typeof emailLoginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;

export interface AuthResponse {
	access_token: string;
	user: Omit<User, "password">;
}
