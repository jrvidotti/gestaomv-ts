import type { Db } from "@/db";
import { cargos, departamentos } from "@/db/schemas";
import type {
	AtualizarCargoData,
	CriarCargoData,
	FiltrosCargos,
} from "@/modules/rh/dtos";
import { and, asc, count, eq, sql } from "drizzle-orm";

export class CargosService {
	constructor(private db: Db) {}

	async criarCargo(cargoData: CriarCargoData) {
		const [cargo] = await this.db
			.insert(cargos)
			.values({
				...cargoData,
			})
			.returning();

		return cargo;
	}

	async listarCargos(filtros?: FiltrosCargos) {
		const { busca, departamentoId, pagina = 1, limite = 20 } = filtros || {};
		const offset = (pagina - 1) * limite;

		const condicoes = [];

		if (busca) {
			condicoes.push(
				sql`${cargos.nome} LIKE ${`%${busca}%`} OR ${cargos.descricao} LIKE ${`%${busca}%`}`,
			);
		}

		if (departamentoId) {
			condicoes.push(eq(cargos.departamentoId, departamentoId));
		}

		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const cargosList = await this.db
			.select({
				id: cargos.id,
				nome: cargos.nome,
				descricao: cargos.descricao,
				departamentoId: cargos.departamentoId,
				pontowebId: cargos.pontowebId,
				criadoEm: cargos.criadoEm,
				atualizadoEm: cargos.atualizadoEm,
				departamento: {
					id: departamentos.id,
					nome: departamentos.nome,
				},
			})
			.from(cargos)
			.leftJoin(departamentos, eq(cargos.departamentoId, departamentos.id))
			.where(whereClause)
			.orderBy(asc(cargos.nome))
			.limit(limite)
			.offset(offset);

		const [{ total }] = await this.db
			.select({ total: count() })
			.from(cargos)
			.where(whereClause);

		return {
			cargos: cargosList,
			total: Number(total),
		};
	}

	async buscarCargoPorId(id: number) {
		const cargo = await this.db.query.cargos.findFirst({
			where: eq(cargos.id, id),
			with: {
				departamento: true,
			},
		});

		return cargo;
	}

	async buscarCargoPorNome(nome: string) {
		const cargo = await this.db.query.cargos.findFirst({
			where: eq(cargos.nome, nome),
			with: {
				departamento: true,
			},
		});

		return cargo;
	}

	async buscarCargosPorDepartamento(departamentoId: number) {
		const cargosList = await this.db.query.cargos.findMany({
			where: eq(cargos.departamentoId, departamentoId),
			orderBy: [asc(cargos.nome)],
		});

		return cargosList;
	}

	async buscarCargoPorPontowebId(pontowebId: number) {
		const cargo = await this.db.query.cargos.findFirst({
			where: eq(cargos.pontowebId, pontowebId),
			with: {
				departamento: true,
			},
		});

		return cargo;
	}

	async atualizarCargo(id: number, cargoData: AtualizarCargoData) {
		const dadosAtualizacao = {
			...cargoData,
			atualizadoEm: new Date().toISOString(),
		};

		await this.db.update(cargos).set(dadosAtualizacao).where(eq(cargos.id, id));

		return await this.buscarCargoPorId(id);
	}

	async deletarCargo(id: number): Promise<void> {
		await this.db.delete(cargos).where(eq(cargos.id, id));
	}
}
