import { db } from "@/db";
import {
	cargos,
	departamentos,
	empresas,
	funcionarios,
	unidades,
} from "@/db/schemas";
import type {
	AtualizarFuncionarioData,
	CriarFuncionarioData,
	FiltrosFuncionarios,
} from "@/modules/rh/dtos";
import type { StatusFuncionarioType } from "@/modules/rh/types";
import { and, asc, count, eq, inArray, sql } from "drizzle-orm";

export class FuncionariosService {
	async criarFuncionario(funcionarioData: CriarFuncionarioData) {
		const [funcionario] = await db
			.insert(funcionarios)
			.values({
				...funcionarioData,
				status: funcionarioData.status || "ATIVO",
			})
			.returning();

		return funcionario;
	}

	async listarFuncionarios(filtros?: FiltrosFuncionarios) {
		const {
			busca,
			cargoId,
			departamentoId,
			empresaId,
			unidadeId,
			status,
			pagina = 1,
			limite = 20,
		} = filtros || {};

		const offset = (pagina - 1) * limite;

		const condicoes = [];

		if (busca) {
			condicoes.push(
				sql`${funcionarios.nome} LIKE ${`%${busca}%`} OR ${funcionarios.cpf} LIKE ${`%${busca}%`} OR ${funcionarios.email} LIKE ${`%${busca}%`}`,
			);
		}

		if (cargoId) {
			condicoes.push(eq(funcionarios.cargoId, cargoId));
		}

		if (departamentoId) {
			condicoes.push(eq(funcionarios.departamentoId, departamentoId));
		}

		if (empresaId) {
			condicoes.push(eq(funcionarios.empresaId, empresaId));
		}

		if (unidadeId) {
			condicoes.push(eq(funcionarios.unidadeId, unidadeId));
		}

		if (status && status.length > 0) {
			condicoes.push(inArray(funcionarios.status, status));
		}

		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const funcionariosList = await db
			.select({
				id: funcionarios.id,
				nome: funcionarios.nome,
				cpf: funcionarios.cpf,
				dataNascimento: funcionarios.dataNascimento,
				sexo: funcionarios.sexo,
				nomeMae: funcionarios.nomeMae,
				email: funcionarios.email,
				telefone: funcionarios.telefone,
				foto: funcionarios.foto,
				cargoId: funcionarios.cargoId,
				departamentoId: funcionarios.departamentoId,
				empresaId: funcionarios.empresaId,
				unidadeId: funcionarios.unidadeId,
				dataAdmissao: funcionarios.dataAdmissao,
				dataAvisoPrevio: funcionarios.dataAvisoPrevio,
				dataDesligamento: funcionarios.dataDesligamento,
				status: funcionarios.status,
				pontowebId: funcionarios.pontowebId,
				criadoEm: funcionarios.criadoEm,
				atualizadoEm: funcionarios.atualizadoEm,
				cargo: {
					id: cargos.id,
					nome: cargos.nome,
				},
				departamento: {
					id: departamentos.id,
					nome: departamentos.nome,
				},
				empresa: {
					id: empresas.id,
					razaoSocial: empresas.razaoSocial,
				},
				unidade: {
					id: unidades.id,
					nome: unidades.nome,
				},
			})
			.from(funcionarios)
			.leftJoin(cargos, eq(funcionarios.cargoId, cargos.id))
			.leftJoin(
				departamentos,
				eq(funcionarios.departamentoId, departamentos.id),
			)
			.leftJoin(empresas, eq(funcionarios.empresaId, empresas.id))
			.leftJoin(unidades, eq(funcionarios.unidadeId, unidades.id))
			.where(whereClause)
			.orderBy(asc(funcionarios.nome))
			.limit(limite)
			.offset(offset);

		const [{ total }] = await db
			.select({ total: count() })
			.from(funcionarios)
			.where(whereClause);

		return {
			funcionarios: funcionariosList,
			total: Number(total),
		};
	}

	async buscarFuncionarioPorId(id: number) {
		const funcionario = await db.query.funcionarios.findFirst({
			where: eq(funcionarios.id, id),
			with: {
				cargo: true,
				departamento: true,
				empresa: true,
				unidade: true,
				equipes: {
					with: {
						equipe: true,
					},
				},
			},
		});

		return funcionario;
	}

	async buscarFuncionarioPorCpf(cpf: string) {
		const funcionario = await db.query.funcionarios.findFirst({
			where: eq(funcionarios.cpf, cpf),
			with: {
				cargo: true,
				departamento: true,
				empresa: true,
				unidade: true,
			},
		});

		return funcionario;
	}

	async buscarFuncionarioPorEmail(email: string) {
		const funcionario = await db.query.funcionarios.findFirst({
			where: eq(funcionarios.email, email),
			with: {
				cargo: true,
				departamento: true,
				empresa: true,
				unidade: true,
			},
		});

		return funcionario;
	}

	async buscarFuncionariosPorDepartamento(departamentoId: number) {
		const funcionariosList = await db.query.funcionarios.findMany({
			where: eq(funcionarios.departamentoId, departamentoId),
			with: {
				cargo: true,
			},
			orderBy: [asc(funcionarios.nome)],
		});

		return funcionariosList;
	}

	async buscarFuncionariosPorCargo(cargoId: number) {
		const funcionariosList = await db.query.funcionarios.findMany({
			where: eq(funcionarios.cargoId, cargoId),
			with: {
				departamento: true,
			},
			orderBy: [asc(funcionarios.nome)],
		});

		return funcionariosList;
	}

	async buscarFuncionariosPorStatus(status: StatusFuncionarioType[]) {
		const funcionariosList = await db.query.funcionarios.findMany({
			where: inArray(funcionarios.status, status),
			with: {
				cargo: true,
				departamento: true,
			},
			orderBy: [asc(funcionarios.nome)],
		});

		return funcionariosList;
	}

	async buscarFuncionarioPorPontowebId(pontowebId: number) {
		const funcionario = await db.query.funcionarios.findFirst({
			where: eq(funcionarios.pontowebId, pontowebId),
			with: {
				cargo: true,
				departamento: true,
				empresa: true,
				unidade: true,
			},
		});

		return funcionario;
	}

	async atualizarFuncionario(
		id: number,
		funcionarioData: AtualizarFuncionarioData,
	) {
		const dadosAtualizacao = {
			...funcionarioData,
			atualizadoEm: new Date().toISOString(),
		};

		await db
			.update(funcionarios)
			.set(dadosAtualizacao)
			.where(eq(funcionarios.id, id));

		return await this.buscarFuncionarioPorId(id);
	}

	async alterarStatusFuncionario(
		id: number,
		status: StatusFuncionarioType,
		dadosAdicionais?: {
			dataAvisoPrevio?: string;
			dataDesligamento?: string;
		},
	) {
		const dadosAtualizacao = {
			status,
			...dadosAdicionais,
			atualizadoEm: new Date().toISOString(),
		};

		await db
			.update(funcionarios)
			.set(dadosAtualizacao)
			.where(eq(funcionarios.id, id));

		return await this.buscarFuncionarioPorId(id);
	}

	async deletarFuncionario(id: number): Promise<void> {
		await db.delete(funcionarios).where(eq(funcionarios.id, id));
	}
}

export const funcionariosService = new FuncionariosService();
