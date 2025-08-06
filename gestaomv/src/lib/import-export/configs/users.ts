import type { UserRoleType } from "@/constants";
import { getDatabase } from "@/db";
import { userRoles, users } from "@/db/schemas";
import type { ImportExportOptions } from "@/lib/import-export";
import bcrypt from "bcrypt";

export interface UserImport {
	email: string;
	name: string;
	password: string | null;
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
			password: null,
		}));
	},
	importarItem: async (usuario) => {
		const password = usuario.password
			? await bcrypt.hash(usuario.password, 10)
			: null;

		const result = await getDatabase()
			.insert(users)
			.values({
				email: usuario.email,
				name: usuario.name,
				password: password || undefined,
				isActive: usuario.isActive,
			})
			.onConflictDoNothing();

		if (result.changes === 0) return false;

		if (usuario.roles.length > 0) {
			await getDatabase()
				.insert(userRoles)
				.values(
					usuario.roles.map((role) => ({
						userId: result.lastInsertRowid as number,
						role: role as UserRoleType,
					})),
				);
		}

		return true;
	},
} satisfies ImportExportOptions<UserImport>;
