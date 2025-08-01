import { db } from "@/db";
import { eq } from "drizzle-orm";
import type { CreateEmpresaDto, UpdateEmpresaDto } from "../dtos";
import { empresas } from "../schemas";
import type { Empresa } from "../types";

export class EmpresasService {
	private get db() {
		return db;
	}

	async create(empresaData: CreateEmpresaDto): Promise<Empresa> {
		const [empresa] = await this.db
			.insert(empresas)
			.values({
				...empresaData,
			})
			.returning();

		return empresa;
	}

	async findAll(): Promise<Empresa[]> {
		const allEmpresas = await this.db.query.empresas.findMany({
			with: {
				unidades: true,
			},
			orderBy: (empresas, { asc }) => [asc(empresas.razaoSocial)],
		});

		return allEmpresas;
	}

	async findOne(id: number): Promise<Empresa | undefined> {
		const empresa = await this.db.query.empresas.findFirst({
			where: eq(empresas.id, id),
			with: {
				unidades: true,
			},
		});

		if (!empresa) return undefined;

		return empresa;
	}

	async update(
		id: number,
		empresaData: UpdateEmpresaDto,
	): Promise<Empresa | undefined> {
		const updateData = {
			...empresaData,
			atualizadoEm: new Date().toISOString(),
		};

		await this.db.update(empresas).set(updateData).where(eq(empresas.id, id));

		return await this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.db.delete(empresas).where(eq(empresas.id, id));
	}

	async findByCnpj(cnpj: string): Promise<Empresa | undefined> {
		const empresa = await this.db.query.empresas.findFirst({
			where: eq(empresas.cnpj, cnpj),
			with: {
				unidades: true,
			},
		});

		if (!empresa) return undefined;

		return empresa;
	}

	async findByPontowebId(pontowebId: number): Promise<Empresa | undefined> {
		const empresa = await this.db.query.empresas.findFirst({
			where: eq(empresas.pontowebId, pontowebId),
			with: {
				unidades: true,
			},
		});

		if (!empresa) return undefined;

		return empresa;
	}
}
