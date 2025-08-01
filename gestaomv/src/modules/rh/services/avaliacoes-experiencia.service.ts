import { db } from "@/db";
import { avaliacoesExperiencia, funcionarios, users } from "@/db/schemas";
import type {
	AtualizarAvaliacaoExperienciaData,
	CriarAvaliacaoExperienciaData,
	FiltrosAvaliacoesExperiencia,
} from "@/modules/rh/dtos";
import type { TipoAvaliacaoExperienciaType } from "@/modules/rh/types";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";

export class AvaliacoesExperienciaService {
	private calcularMedia(
		pontualidade: number,
		comprometimento: number,
		trabalhoEquipe: number,
		iniciativa: number,
		comunicacao: number,
		conhecimentoTecnico: number,
	): number {
		return (
			(pontualidade +
				comprometimento +
				trabalhoEquipe +
				iniciativa +
				comunicacao +
				conhecimentoTecnico) /
			6
		);
	}

	async criarAvaliacaoExperiencia(
		avaliacaoData: CriarAvaliacaoExperienciaData & { avaliadorId: number },
	) {
		const mediaFinal = this.calcularMedia(
			avaliacaoData.pontualidade,
			avaliacaoData.comprometimento,
			avaliacaoData.trabalhoEquipe,
			avaliacaoData.iniciativa,
			avaliacaoData.comunicacao,
			avaliacaoData.conhecimentoTecnico,
		);

		const [avaliacao] = await db
			.insert(avaliacoesExperiencia)
			.values({
				...avaliacaoData,
				mediaFinal: Number(mediaFinal.toFixed(2)),
			})
			.returning();

		return avaliacao;
	}

	async listarAvaliacoesExperiencia(filtros?: FiltrosAvaliacoesExperiencia) {
		const {
			funcionarioId,
			avaliadorId,
			tipo,
			recomendacao,
			dataInicial,
			dataFinal,
			pagina = 1,
			limite = 20,
		} = filtros || {};

		const offset = (pagina - 1) * limite;

		const condicoes = [];

		if (funcionarioId) {
			condicoes.push(eq(avaliacoesExperiencia.funcionarioId, funcionarioId));
		}

		if (avaliadorId) {
			condicoes.push(eq(avaliacoesExperiencia.avaliadorId, avaliadorId));
		}

		if (tipo) {
			condicoes.push(eq(avaliacoesExperiencia.tipo, tipo));
		}

		if (recomendacao) {
			condicoes.push(eq(avaliacoesExperiencia.recomendacao, recomendacao));
		}

		if (dataInicial) {
			condicoes.push(gte(avaliacoesExperiencia.dataAvaliacao, dataInicial));
		}

		if (dataFinal) {
			condicoes.push(lte(avaliacoesExperiencia.dataAvaliacao, dataFinal));
		}

		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const avaliacoesList = await db
			.select({
				id: avaliacoesExperiencia.id,
				funcionarioId: avaliacoesExperiencia.funcionarioId,
				avaliadorId: avaliacoesExperiencia.avaliadorId,
				tipo: avaliacoesExperiencia.tipo,
				dataAvaliacao: avaliacoesExperiencia.dataAvaliacao,
				pontualidade: avaliacoesExperiencia.pontualidade,
				comprometimento: avaliacoesExperiencia.comprometimento,
				trabalhoEquipe: avaliacoesExperiencia.trabalhoEquipe,
				iniciativa: avaliacoesExperiencia.iniciativa,
				comunicacao: avaliacoesExperiencia.comunicacao,
				conhecimentoTecnico: avaliacoesExperiencia.conhecimentoTecnico,
				mediaFinal: avaliacoesExperiencia.mediaFinal,
				recomendacao: avaliacoesExperiencia.recomendacao,
				pontosFortes: avaliacoesExperiencia.pontosFortes,
				pontosMelhoria: avaliacoesExperiencia.pontosMelhoria,
				observacoes: avaliacoesExperiencia.observacoes,
				criadoEm: avaliacoesExperiencia.criadoEm,
				atualizadoEm: avaliacoesExperiencia.atualizadoEm,
				funcionario: {
					id: funcionarios.id,
					nome: funcionarios.nome,
					cpf: funcionarios.cpf,
				},
				avaliador: {
					id: users.id,
					name: users.name,
					email: users.email,
				},
			})
			.from(avaliacoesExperiencia)
			.leftJoin(
				funcionarios,
				eq(avaliacoesExperiencia.funcionarioId, funcionarios.id),
			)
			.leftJoin(users, eq(avaliacoesExperiencia.avaliadorId, users.id))
			.where(whereClause)
			.orderBy(desc(avaliacoesExperiencia.dataAvaliacao))
			.limit(limite)
			.offset(offset);

		const [{ total }] = await db
			.select({ total: count() })
			.from(avaliacoesExperiencia)
			.where(whereClause);

		return {
			avaliacoes: avaliacoesList,
			total: Number(total),
		};
	}

	async buscarAvaliacaoExperienciaPorId(id: number) {
		const avaliacao = await db.query.avaliacoesExperiencia.findFirst({
			where: eq(avaliacoesExperiencia.id, id),
			with: {
				funcionario: {
					with: {
						cargo: true,
						departamento: true,
					},
				},
				avaliador: true,
			},
		});

		return avaliacao;
	}

	async buscarAvaliacoesPorFuncionario(funcionarioId: number) {
		const avaliacoesList = await db.query.avaliacoesExperiencia.findMany({
			where: eq(avaliacoesExperiencia.funcionarioId, funcionarioId),
			with: {
				avaliador: true,
			},
			orderBy: [desc(avaliacoesExperiencia.dataAvaliacao)],
		});

		return avaliacoesList;
	}

	async buscarAvaliacoesPorAvaliador(avaliadorId: number) {
		const avaliacoesList = await db.query.avaliacoesExperiencia.findMany({
			where: eq(avaliacoesExperiencia.avaliadorId, avaliadorId),
			with: {
				funcionario: {
					with: {
						cargo: true,
						departamento: true,
					},
				},
			},
			orderBy: [desc(avaliacoesExperiencia.dataAvaliacao)],
		});

		return avaliacoesList;
	}

	async buscarAvaliacoesPorTipo(tipo: TipoAvaliacaoExperienciaType) {
		const avaliacoesList = await db.query.avaliacoesExperiencia.findMany({
			where: eq(avaliacoesExperiencia.tipo, tipo),
			with: {
				funcionario: {
					with: {
						cargo: true,
						departamento: true,
					},
				},
				avaliador: true,
			},
			orderBy: [desc(avaliacoesExperiencia.dataAvaliacao)],
		});

		return avaliacoesList;
	}

	async buscarUltimaAvaliacaoFuncionario(funcionarioId: number) {
		const ultimaAvaliacao = await db.query.avaliacoesExperiencia.findFirst({
			where: eq(avaliacoesExperiencia.funcionarioId, funcionarioId),
			with: {
				avaliador: true,
			},
			orderBy: [desc(avaliacoesExperiencia.dataAvaliacao)],
		});

		return ultimaAvaliacao;
	}

	async atualizarAvaliacaoExperiencia(
		id: number,
		avaliacaoData: AtualizarAvaliacaoExperienciaData,
	) {
		let dadosAtualizacao = {
			...avaliacaoData,
			atualizadoEm: new Date().toISOString(),
		};

		if (
			avaliacaoData.pontualidade !== undefined ||
			avaliacaoData.comprometimento !== undefined ||
			avaliacaoData.trabalhoEquipe !== undefined ||
			avaliacaoData.iniciativa !== undefined ||
			avaliacaoData.comunicacao !== undefined ||
			avaliacaoData.conhecimentoTecnico !== undefined
		) {
			const avaliacaoAtual = await this.buscarAvaliacaoExperienciaPorId(id);
			if (avaliacaoAtual) {
				const novaMedia = this.calcularMedia(
					avaliacaoData.pontualidade ?? avaliacaoAtual.pontualidade,
					avaliacaoData.comprometimento ?? avaliacaoAtual.comprometimento,
					avaliacaoData.trabalhoEquipe ?? avaliacaoAtual.trabalhoEquipe,
					avaliacaoData.iniciativa ?? avaliacaoAtual.iniciativa,
					avaliacaoData.comunicacao ?? avaliacaoAtual.comunicacao,
					avaliacaoData.conhecimentoTecnico ??
						avaliacaoAtual.conhecimentoTecnico,
				);

				dadosAtualizacao = {
					...dadosAtualizacao,
					mediaFinal: Number(novaMedia.toFixed(2)),
				};
			}
		}

		await db
			.update(avaliacoesExperiencia)
			.set(dadosAtualizacao)
			.where(eq(avaliacoesExperiencia.id, id));

		return await this.buscarAvaliacaoExperienciaPorId(id);
	}

	async deletarAvaliacaoExperiencia(id: number): Promise<void> {
		await db
			.delete(avaliacoesExperiencia)
			.where(eq(avaliacoesExperiencia.id, id));
	}
}
