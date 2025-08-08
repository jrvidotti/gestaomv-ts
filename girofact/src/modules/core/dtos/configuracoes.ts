import { z } from "zod";

export const configuracoesSistemaSchema = z.object({
	allowUserRegistration: z.boolean().default(true),
	maintenanceMode: z.boolean().default(false),
	emailNotifications: z.boolean().default(true),
	notifyNewUsers: z.boolean().default(false),
	newUserNotificationAdmins: z.string().default(""),
	notifyUserApproval: z.boolean().default(true),
});

export const updateConfiguracoesSistemaSchema = z.object({
	allowUserRegistration: z.boolean().optional(),
	maintenanceMode: z.boolean().optional(),
	emailNotifications: z.boolean().optional(),
	notifyNewUsers: z.boolean().optional(),
	newUserNotificationAdmins: z.string().optional(),
	notifyUserApproval: z.boolean().optional(),
});

export const settingSchema = z.object({
	id: z.number(),
	key: z.string(),
	value: z.string(),
	description: z.string().nullable(),
	category: z.string(),
	isPublic: z.boolean(),
	createdAt: z.string().nullable(),
	updatedAt: z.string().nullable(),
});

export const newSettingSchema = z.object({
	key: z.string().min(1, "Chave é obrigatória"),
	value: z.string(),
	description: z.string().optional(),
	category: z.string().default("general"),
	isPublic: z.boolean().default(false),
});

export const updateSettingSchema = z.object({
	key: z.string(),
	value: z.string(),
	description: z.string().optional(),
});

export type ConfiguracoesSistemaDto = z.infer<
	typeof configuracoesSistemaSchema
>;
export type UpdateConfiguracoesSistemaDto = z.infer<
	typeof updateConfiguracoesSistemaSchema
>;

export type SettingDto = z.infer<typeof settingSchema>;
export type NewSettingDto = z.infer<typeof newSettingSchema>;
export type UpdateSettingDto = z.infer<typeof updateSettingSchema>;
