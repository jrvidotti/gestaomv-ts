import type { Db } from "@/db";
import { eq } from "drizzle-orm";
import type { CreateEmpresaDto, UpdateEmpresaDto } from "../dtos";
import { empresas } from "../schemas";
import type { Empresa } from "../types";

export class EmpresasService {
	constructor(private readonly db: Db) {}

	async criar(empresaData: CreateEmpresaDto): Promise<Empresa> {
		const [empresa] = await this.db
			.insert(empresas)
			.values({
				...empresaData,
			})
			.returning();

		return empresa;
	}

	async listar(): Promise<Empresa[]> {
		const allEmpresas = await this.db.query.empresas.findMany({
			with: {
				unidades: true,
			},
			orderBy: (empresas, { asc }) => [asc(empresas.razaoSocial)],
		});

		return allEmpresas;
	}

	async buscar(id: number): Promise<Empresa | undefined> {
		const empresa = await this.db.query.empresas.findFirst({
			where: eq(empresas.id, id),
			with: {
				unidades: true,
			},
		});

		if (!empresa) return undefined;

		return empresa;
	}

	async atualizar(
		id: number,
		empresaData: UpdateEmpresaDto,
	): Promise<Empresa | undefined> {
		const updateData = {
			...empresaData,
			atualizadoEm: new Date().toISOString(),
		};

		await this.db.update(empresas).set(updateData).where(eq(empresas.id, id));

		return await this.buscar(id);
	}

	async deletar(id: number): Promise<void> {
		await this.db.delete(empresas).where(eq(empresas.id, id));
	}

	async buscarPorCnpj(cnpj: string): Promise<Empresa | undefined> {
		const empresa = await this.db.query.empresas.findFirst({
			where: eq(empresas.cnpj, cnpj),
			with: {
				unidades: true,
			},
		});

		if (!empresa) return undefined;

		return empresa;
	}

	async buscarPorPontowebId(pontowebId: number): Promise<Empresa | undefined> {
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
