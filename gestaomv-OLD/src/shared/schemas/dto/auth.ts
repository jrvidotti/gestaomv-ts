import { USER_ROLES_ARRAY, type UserRoleType } from "@/shared";
import { z } from "zod";

const userRoleEnumSchema = z.enum(USER_ROLES_ARRAY) as z.ZodType<UserRoleType>;

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

export const roleLabels = {
	admin: "Administrador",
	manager: "Gerente",
	user: "Usuário",
};

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

// Schemas para Empresas
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
