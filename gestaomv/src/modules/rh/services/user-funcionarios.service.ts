import { db } from "@/db";
import { funcionarios, userFuncionarios, users } from "@/db/schemas";
import type {
	CriarUserFuncionarioData,
	FiltrosUserFuncionarios,
} from "@/modules/rh/dtos";
import { and, count, eq } from "drizzle-orm";

export class UserFuncionariosService {
	async criarUserFuncionario(userFuncionarioData: CriarUserFuncionarioData) {
		const [userFuncionario] = await db
			.insert(userFuncionarios)
			.values({
				...userFuncionarioData,
			})
			.returning();

		return userFuncionario;
	}

	async listarUserFuncionarios(filtros?: FiltrosUserFuncionarios) {
		const { userId, funcionarioId, pagina = 1, limite = 20 } = filtros || {};
		const offset = (pagina - 1) * limite;

		const condicoes = [];

		if (userId) {
			condicoes.push(eq(userFuncionarios.userId, userId));
		}

		if (funcionarioId) {
			condicoes.push(eq(userFuncionarios.funcionarioId, funcionarioId));
		}

		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const userFuncionariosList = await db
			.select({
				userId: userFuncionarios.userId,
				funcionarioId: userFuncionarios.funcionarioId,
				user: {
					id: users.id,
					name: users.name,
					email: users.email,
				},
				funcionario: {
					id: funcionarios.id,
					nome: funcionarios.nome,
					cpf: funcionarios.cpf,
					email: funcionarios.email,
				},
			})
			.from(userFuncionarios)
			.leftJoin(users, eq(userFuncionarios.userId, users.id))
			.leftJoin(
				funcionarios,
				eq(userFuncionarios.funcionarioId, funcionarios.id),
			)
			.where(whereClause)
			.limit(limite)
			.offset(offset);

		const [{ total }] = await db
			.select({ total: count() })
			.from(userFuncionarios)
			.where(whereClause);

		return {
			userFuncionarios: userFuncionariosList,
			total: Number(total),
		};
	}

	async buscarUserFuncionarioPorUserId(userId: string) {
		const userFuncionario = await db.query.userFuncionarios.findFirst({
			where: eq(userFuncionarios.userId, userId),
			with: {
				user: true,
				funcionario: {
					with: {
						cargo: true,
						departamento: true,
						empresa: true,
						unidade: true,
					},
				},
			},
		});

		return userFuncionario;
	}

	async buscarUserFuncionarioPorFuncionarioId(funcionarioId: string) {
		const userFuncionario = await db.query.userFuncionarios.findFirst({
			where: eq(userFuncionarios.funcionarioId, funcionarioId),
			with: {
				user: true,
				funcionario: {
					with: {
						cargo: true,
						departamento: true,
						empresa: true,
						unidade: true,
					},
				},
			},
		});

		return userFuncionario;
	}

	async buscarFuncionarioPorUser(userId: string) {
		const userFuncionario = await this.buscarUserFuncionarioPorUserId(userId);
		return userFuncionario?.funcionario || null;
	}

	async buscarUserPorFuncionario(funcionarioId: string) {
		const userFuncionario =
			await this.buscarUserFuncionarioPorFuncionarioId(funcionarioId);
		return userFuncionario?.user || null;
	}

	async verificarVinculoExiste(
		userId: string,
		funcionarioId: string,
	): Promise<boolean> {
		const vinculo = await db.query.userFuncionarios.findFirst({
			where: and(
				eq(userFuncionarios.userId, userId),
				eq(userFuncionarios.funcionarioId, funcionarioId),
			),
		});

		return !!vinculo;
	}

	async deletarUserFuncionario(
		userId: string,
		funcionarioId: string,
	): Promise<void> {
		await db
			.delete(userFuncionarios)
			.where(
				and(
					eq(userFuncionarios.userId, userId),
					eq(userFuncionarios.funcionarioId, funcionarioId),
				),
			);
	}

	async deletarVinculoPorUserId(userId: string): Promise<void> {
		await db
			.delete(userFuncionarios)
			.where(eq(userFuncionarios.userId, userId));
	}

	async deletarVinculoPorFuncionarioId(funcionarioId: string): Promise<void> {
		await db
			.delete(userFuncionarios)
			.where(eq(userFuncionarios.funcionarioId, funcionarioId));
	}
}

export const userFuncionariosService = new UserFuncionariosService();
