import { db } from "@/db";
import { departamentos } from "@/db/schemas";
import type {
	AtualizarDepartamentoData,
	CriarDepartamentoData,
	FiltrosDepartamentos,
} from "@/modules/rh/dtos";
import { and, asc, count, eq, sql } from "drizzle-orm";

export class DepartamentosService {
	async criarDepartamento(departamentoData: CriarDepartamentoData) {
		const [departamento] = await db
			.insert(departamentos)
			.values({
				...departamentoData,
			})
			.returning();

		return departamento;
	}

	async listarDepartamentos(filtros?: FiltrosDepartamentos) {
		const { busca, pagina = 1, limite = 20 } = filtros || {};
		const offset = (pagina - 1) * limite;

		const condicoes = [];

		if (busca) {
			condicoes.push(
				sql`${departamentos.nome} LIKE ${`%${busca}%`} OR ${departamentos.descricao} LIKE ${`%${busca}%`}`,
			);
		}

		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const departamentosList = await db
			.select()
			.from(departamentos)
			.where(whereClause)
			.orderBy(asc(departamentos.nome))
			.limit(limite)
			.offset(offset);

		const [{ total }] = await db
			.select({ total: count() })
			.from(departamentos)
			.where(whereClause);

		return {
			departamentos: departamentosList,
			total: Number(total),
		};
	}

	async buscarDepartamentoPorId(id: number) {
		const departamento = await db.query.departamentos.findFirst({
			where: eq(departamentos.id, id),
		});

		return departamento;
	}

	async buscarDepartamentoPorNome(nome: string) {
		const departamento = await db.query.departamentos.findFirst({
			where: eq(departamentos.nome, nome),
		});

		return departamento;
	}

	async buscarDepartamentoPorPontowebId(pontowebId: number) {
		const departamento = await db.query.departamentos.findFirst({
			where: eq(departamentos.pontowebId, pontowebId),
		});

		return departamento;
	}

	async atualizarDepartamento(
		id: number,
		departamentoData: AtualizarDepartamentoData,
	) {
		const dadosAtualizacao = {
			...departamentoData,
			atualizadoEm: new Date().toISOString(),
		};

		await db
			.update(departamentos)
			.set(dadosAtualizacao)
			.where(eq(departamentos.id, id));

		return await this.buscarDepartamentoPorId(id);
	}

	async deletarDepartamento(id: number): Promise<void> {
		await db.delete(departamentos).where(eq(departamentos.id, id));
	}
}

export const departamentosService = new DepartamentosService();
