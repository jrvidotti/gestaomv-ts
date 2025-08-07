import { db } from "@/db";
import { eq } from "drizzle-orm";
import type { CreateUnidadeDto, UpdateUnidadeDto } from "../dtos";
import { unidades } from "../schemas";
import type { Unidade } from "../types";

export class UnidadesService {
	private get db() {
		return db;
	}

	async criar(unidadeData: CreateUnidadeDto): Promise<Unidade> {
		const [unidade] = await this.db
			.insert(unidades)
			.values({
				...unidadeData,
			})
			.returning();

		return unidade;
	}

	async findAll(): Promise<Unidade[]> {
		const allUnidades = await this.db.query.unidades.findMany({
			with: {
				empresa: true,
			},
			orderBy: (unidades, { asc }) => [asc(unidades.nome)],
		});

		return allUnidades;
	}

	async buscar(id: number): Promise<Unidade | undefined> {
		const unidade = await this.db.query.unidades.findFirst({
			where: eq(unidades.id, id),
			with: {
				empresa: true,
			},
		});

		if (!unidade) return undefined;

		return unidade;
	}

	async atualizar(
		id: number,
		unidadeData: UpdateUnidadeDto,
	): Promise<Unidade | undefined> {
		const updateData = {
			...unidadeData,
			atualizadoEm: new Date().toISOString(),
		};

		await this.db.update(unidades).set(updateData).where(eq(unidades.id, id));

		return await this.buscar(id);
	}

	async deletar(id: number): Promise<void> {
		await this.db.delete(unidades).where(eq(unidades.id, id));
	}

	async buscarPorCodigo(codigo: number): Promise<Unidade | undefined> {
		const unidade = await this.db.query.unidades.findFirst({
			where: eq(unidades.codigo, codigo),
			with: {
				empresa: true,
			},
		});

		if (!unidade) return undefined;

		return unidade;
	}

	async buscarPorEmpresa(empresaId: number): Promise<Unidade[]> {
		const unidadesByEmpresa = await this.db.query.unidades.findMany({
			where: eq(unidades.empresaId, empresaId),
			with: {
				empresa: true,
			},
			orderBy: (unidades, { asc }) => [asc(unidades.nome)],
		});

		return unidadesByEmpresa;
	}

	async findByPontowebId(pontowebId: number): Promise<Unidade | undefined> {
		const unidade = await this.db.query.unidades.findFirst({
			where: eq(unidades.pontowebId, pontowebId),
			with: {
				empresa: true,
			},
		});

		if (!unidade) return undefined;

		return unidade;
	}
}

export const unidadesService = new UnidadesService();
