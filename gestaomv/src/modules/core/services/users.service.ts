import { db } from "@/db";
import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import type { ChangePasswordDto } from "../dtos";
import { userRoles, userTagone, users } from "../schemas";
import type { CriarUser, User, UserRoleType } from "../types";

export class UsersService {
	async criar(
		userData: Omit<CriarUser, "id" | "createdAt" | "updatedAt">,
		roles?: UserRoleType[],
	): Promise<User> {
		const dataToInsert = { ...userData };

		// Hash da senha apenas se ela existir
		if (userData.password) {
			dataToInsert.password = await bcrypt.hash(userData.password, 10);
		}

		const [user] = await db.insert(users).values(dataToInsert).returning();

		if (roles) {
			await db
				.insert(userRoles)
				.values(roles.map((role) => ({ userId: user.id, role })));
		}

		return { ...user, roles: [] };
	}

	async listar(): Promise<User[]> {
		const users = await db.query.users.findMany({
			with: {
				userRoles: {
					columns: {
						role: true,
					},
				},
			},
		});
		return users.map((userWithRoles) => {
			const { userRoles, ...user } = userWithRoles;
			return {
				...user,
				roles: userRoles.map((r) => r.role),
			};
		});
	}

	async buscar(id: number): Promise<User | undefined> {
		const userWithRoles = await db.query.users.findFirst({
			where: eq(users.id, id),
			with: {
				userRoles: {
					columns: {
						role: true,
					},
				},
			},
		});
		if (!userWithRoles) return undefined;
		const { userRoles, ...user } = userWithRoles;
		return {
			...user,
			roles: userRoles.map((r) => r.role),
		};
	}

	async findByEmail(email: string): Promise<User | undefined> {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
			columns: {
				id: true,
			},
		});
		if (!user) return undefined;
		return await this.buscar(user.id);
	}

	async findByTagOneUsername(username: string): Promise<User | undefined> {
		const userTagoneRecord = await db.query.userTagone.findFirst({
			where: eq(userTagone.usuarioTagone, username),
			columns: {
				userId: true,
			},
		});
		if (!userTagoneRecord || !userTagoneRecord.userId) return undefined;
		return await this.buscar(userTagoneRecord.userId);
	}

	async atualizar(
		id: number,
		userData: Partial<Omit<CriarUser, "id" | "createdAt">>,
		roles?: UserRoleType[],
	): Promise<User | undefined> {
		// Buscar estado atual do usuário ANTES da atualização
		const currentUser = await this.buscar(id);
		if (!currentUser) {
			throw new Error("Usuário não encontrado");
		}

		const hadNoRoles = !currentUser.roles || currentUser.roles.length === 0;

		const updateData = {
			...userData,
			updatedAt: new Date().toISOString(),
		};

		if (userData.password) {
			updateData.password = await bcrypt.hash(userData.password, 10);
		}

		await db.update(users).set(updateData).where(eq(users.id, id));

		if (roles) {
			await db.delete(userRoles).where(eq(userRoles.userId, id));
			await db
				.insert(userRoles)
				.values(roles.map((role) => ({ userId: id, role })));
		}

		const updatedUser = await this.buscar(id);

		// Verificar se usuário passou de "sem roles" para "com roles" (aprovação)
		if (hadNoRoles && roles && roles.length > 0 && updatedUser) {
			// Usuário foi aprovado - enviar notificação de boas-vindas
			// Usar import dinâmico para evitar dependência circular
			try {
				throw new Error("Not implemented");

				// const notificationsService = new NotificationsService();
				// const { password, ...userWithoutPassword } = updatedUser;
				// await notificationsService.notifyUserApproved(
				// 	userWithoutPassword,
				// 	roles,
				// );
			} catch (error) {
				console.error("Erro ao enviar notificação de aprovação:", error);
				// Não interromper o fluxo principal por erro de notificação
			}
		}

		return updatedUser;
	}

	async deletar(id: number): Promise<void> {
		await db.delete(users).where(eq(users.id, id));
	}

	async validatePassword(
		plainPassword: string,
		hashedPassword: string,
	): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashedPassword);
	}

	async getUserRoles(userId: number): Promise<UserRoleType[]> {
		const roles = await db.query.userRoles.findMany({
			where: eq(userRoles.userId, userId),
			columns: {
				role: true,
			},
		});

		return roles.map((r) => r.role);
	}

	async addUserRole(userId: number, role: UserRoleType): Promise<void> {
		// Verifica se a role já existe para evitar duplicatas
		const existingRole = await db.query.userRoles.findFirst({
			where: and(eq(userRoles.userId, userId), eq(userRoles.role, role)),
		});

		if (!existingRole) {
			await db.insert(userRoles).values({
				userId,
				role,
			});
		}
	}

	async removeUserRole(userId: number, role: UserRoleType): Promise<void> {
		await db
			.delete(userRoles)
			.where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
	}

	async mudarSenha(
		userId: number,
		changePasswordData: Omit<ChangePasswordDto, "confirmPassword">,
	): Promise<void> {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				password: true,
			},
		});

		if (!user) {
			throw new Error("Usuário não encontrado");
		}

		// Verifica se a senha atual está correta
		const isCurrentPasswordValid =
			user.password &&
			(await this.validatePassword(
				changePasswordData.currentPassword,
				user.password,
			));
		if (!isCurrentPasswordValid) {
			throw new Error("Senha atual incorreta");
		}

		// Hash da nova senha
		const hashedNewPassword = await bcrypt.hash(
			changePasswordData.newPassword,
			10,
		);

		// Atualiza a senha no banco de dados
		await db
			.update(users)
			.set({
				password: hashedNewPassword,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));
	}

	async listarUsersPendentes(): Promise<User[]> {
		const usersWithRoles = await db.query.users.findMany({
			where: eq(users.isActive, true),
			with: {
				userRoles: {
					columns: {
						role: true,
					},
				},
			},
		});

		// Filtrar usuários que não têm nenhuma role
		const pendingUsers = usersWithRoles
			.filter((userWithRoles) => userWithRoles.userRoles.length === 0)
			.map((userWithRoles) => {
				const { userRoles, ...user } = userWithRoles;
				return {
					...user,
					roles: [],
				};
			});

		return pendingUsers;
	}

	async buscarStatusUsuarios(): Promise<{
		totalUsers: number;
		activeUsers: number;
		pendingUsers: number;
		inactiveUsers: number;
	}> {
		const allUsers = await db.query.users.findMany({
			with: {
				userRoles: {
					columns: {
						role: true,
					},
				},
			},
		});

		const stats = {
			totalUsers: allUsers.length,
			activeUsers: 0,
			pendingUsers: 0,
			inactiveUsers: 0,
		};

		for (const user of allUsers) {
			if (!user.isActive) {
				stats.inactiveUsers++;
			} else if (user.userRoles.length === 0) {
				stats.pendingUsers++;
			} else {
				stats.activeUsers++;
			}
		}

		return stats;
	}

	async findUsersByRoles(rolesArray: UserRoleType[]): Promise<User[]> {
		if (!rolesArray || rolesArray.length === 0) {
			return [];
		}

		const usersWithRoles = await db.query.users.findMany({
			where: eq(users.isActive, true),
			with: {
				userRoles: {
					columns: {
						role: true,
					},
				},
			},
		});

		// Filtrar usuários que têm pelo menos uma das roles especificadas
		const matchingUsers = usersWithRoles
			.filter((userWithRoles) =>
				userWithRoles.userRoles.some((userRole) =>
					rolesArray.includes(userRole.role),
				),
			)
			.map((userWithRoles) => {
				const { userRoles, ...user } = userWithRoles;
				return {
					...user,
					roles: userRoles.map((r) => r.role),
				};
			});

		return matchingUsers;
	}
}

export const usersService = new UsersService();
