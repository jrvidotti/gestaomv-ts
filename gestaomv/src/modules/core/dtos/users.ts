import { USER_ROLES_ARRAY } from "@/constants";
import type { UserRoleType } from "@/constants";
import z from "zod";

const userRoleEnumSchema = z.enum(USER_ROLES_ARRAY) as z.ZodType<UserRoleType>;

export const createUserSchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
	roles: userRoleEnumSchema.array().default([]),
	isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
	email: z.string().email("Email inválido").optional(),
	password: z
		.string()
		.min(6, "Senha deve ter pelo menos 6 caracteres")
		.optional(),
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
	roles: userRoleEnumSchema.array().optional(),
	isActive: z.boolean().optional(),
});

export const addUserRoleSchema = z.object({
	userId: z.number().positive("ID do usuário deve ser um número positivo"),
	role: userRoleEnumSchema,
});

export const removeUserRoleSchema = z.object({
	userId: z.number().positive("ID do usuário deve ser um número positivo"),
	role: userRoleEnumSchema,
});

export const getUserRolesSchema = z.object({
	userId: z.number().positive("ID do usuário deve ser um número positivo"),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Senha atual é obrigatória"),
		newPassword: z
			.string()
			.min(6, "Nova senha deve ter pelo menos 6 caracteres"),
		confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

export type AddUserRoleDto = z.infer<typeof addUserRoleSchema>;
export type RemoveUserRoleDto = z.infer<typeof removeUserRoleSchema>;
export type GetUserRolesDto = z.infer<typeof getUserRolesSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
