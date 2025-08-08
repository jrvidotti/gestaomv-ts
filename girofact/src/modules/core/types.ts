import type { UserRoleType } from "@/constants";

import type { configuracoes, userRoles, users } from "./schemas";

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

export type Configuracao = typeof configuracoes.$inferSelect;
export type CriarConfiguracao = typeof configuracoes.$inferInsert;
