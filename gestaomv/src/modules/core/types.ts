import type { Funcionario } from "@/modules/rh/types";
import type { USER_ROLES } from "./enums";
import type {
	consultasCpf,
	empresas,
	settings,
	unidades,
	userRoles,
	users,
} from "./schemas";

// ===== USERS =====

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserRole = typeof userRoles.$inferSelect;
export type CriarUserRole = typeof userRoles.$inferInsert;

export type User = typeof users.$inferSelect & {
	roles: UserRoleType[];
};
export type CriarUser = typeof users.$inferInsert & {
	password?: string;
};

// ===== SETTINGS =====

export type Configuracao = typeof settings.$inferSelect;
export type CriarConfiguracao = typeof settings.$inferInsert;

// ===== CONSULTAS CPF =====

export type ConsultaCpf = typeof consultasCpf.$inferSelect;
export type CriarConsultaCpf = typeof consultasCpf.$inferInsert;

// ===== EMPRESAS =====

export type Empresa = typeof empresas.$inferSelect & {
	unidades?: Unidade[];
	funcionarios?: Funcionario[];
};

// ===== UNIDADES =====

export type Unidade = typeof unidades.$inferSelect & {
	empresa?: Empresa | null;
	funcionarios?: Funcionario[];
};
