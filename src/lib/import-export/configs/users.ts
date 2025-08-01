import { getDatabase } from "@/db";
import { userRoles, users } from "@/db/schemas";
import type { UserRoleType } from "@/modules/core/types";
import type { ImportExportOptions } from "@/lib/import-export";

export interface UserImport {
	email: string;
	name: string;
	isActive: boolean;
	roles: string[];
}

export const config = {
	nomeArquivo: "users",
	descricaoArquivo: "Dados de usuários para seed",
	buscarItens: async () => {
		const users = await getDatabase().query.users.findMany({
			columns: {
				email: true,
				name: true,
				isActive: true,
			},
			with: {
				userRoles: {
					columns: {
						role: true,
					},
				},
			},
		});
		return users.map((u) => ({
			...u,
			roles: u.userRoles.map((ur) => ur.role),
			userRoles: undefined,
		}));
	},
	importarItem: async (usuario) => {
		const result = await getDatabase()
			.insert(users)
			.values({
				email: usuario.email,
				name: usuario.name,
				isActive: usuario.isActive,
			})
			.onConflictDoNothing();

		if (result.changes === 0) return false;

		await getDatabase()
			.insert(userRoles)
			.values(
				usuario.roles.map((role) => ({
					userId: result.lastInsertRowid as number,
					role: role as UserRoleType,
				})),
			);

		return true;
	},
} satisfies ImportExportOptions<UserImport>;
