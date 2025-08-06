import type { UserRoleType } from "@/constants";

import type { Funcionario } from "@/modules/rh/types";
import type {
	consultasCpf,
	empresas,
	settings,
	unidades,
	userRoles,
	users,
} from "./schemas";

// ===== USERS =====

export type UserRole = typeof userRoles.$inferSelect;
export type CriarUserRole = typeof userRoles.$inferInsert;

// somente para compatibilidade
export type { UserRoleType } from "@/constants";

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
