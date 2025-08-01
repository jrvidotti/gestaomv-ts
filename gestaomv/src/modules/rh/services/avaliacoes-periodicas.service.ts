import { db } from "@/db";
import { avaliacoesPeriodicas, funcionarios, users } from "@/db/schemas";
import type {
	AtualizarAvaliacaoPeriodicaData,
	CriarAvaliacaoPeriodicaData,
	FiltrosAvaliacoesPeriodicas,
} from "@/modules/rh/dtos";
import type { ClassificacaoAvaliacaoPeriodicaType } from "@/modules/rh/types";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";

export class AvaliacoesPeriodicasService {
	private calcularMedia(
		desempenho: number,
		comprometimento: number,
		trabalhoEquipe: number,
		lideranca: number,
		comunicacao: number,
		inovacao: number,
		resolucaoProblemas: number,
		qualidadeTrabalho: number,
	): number {
		return (
			(desempenho +
				comprometimento +
				trabalhoEquipe +
				lideranca +
				comunicacao +
				inovacao +
				resolucaoProblemas +
				qualidadeTrabalho) /
			8
		);
	}

	private determinarClassificacao(
		media: number,
	): ClassificacaoAvaliacaoPeriodicaType {
		if (media >= 4.5) return "EXCELENTE";
		if (media >= 3.5) return "BOM";
		if (media >= 2.5) return "SATISFATORIO";
		return "INSATISFATORIO";
	}

	async criarAvaliacaoPeriodica(
		avaliacaoData: CriarAvaliacaoPeriodicaData & { avaliadorId: number },
	) {
		const mediaFinal = this.calcularMedia(
			avaliacaoData.desempenho,
			avaliacaoData.comprometimento,
			avaliacaoData.trabalhoEquipe,
			avaliacaoData.lideranca,
			avaliacaoData.comunicacao,
			avaliacaoData.inovacao,
			avaliacaoData.resolucaoProblemas,
			avaliacaoData.qualidadeTrabalho,
		);

		const classificacao = this.determinarClassificacao(mediaFinal);

		const [avaliacao] = await db
			.insert(avaliacoesPeriodicas)
			.values({
				...avaliacaoData,
				mediaFinal: Number(mediaFinal.toFixed(2)),
				classificacao,
			})
			.returning();

		return avaliacao;
	}

	async listarAvaliacoesPeriodicas(filtros?: FiltrosAvaliacoesPeriodicas) {
		const {
			funcionarioId,
			avaliadorId,
			classificacao,
			periodoInicial,
			periodoFinal,
			dataInicial,
			dataFinal,
			pagina = 1,
			limite = 20,
		} = filtros || {};

		const offset = (pagina - 1) * limite;

		const condicoes = [];

		if (funcionarioId) {
			condicoes.push(eq(avaliacoesPeriodicas.funcionarioId, funcionarioId));
		}

		if (avaliadorId) {
			condicoes.push(eq(avaliacoesPeriodicas.avaliadorId, avaliadorId));
		}

		if (classificacao) {
			condicoes.push(eq(avaliacoesPeriodicas.classificacao, classificacao));
		}

		if (periodoInicial) {
			condicoes.push(gte(avaliacoesPeriodicas.periodoInicial, periodoInicial));
		}

		if (periodoFinal) {
			condicoes.push(lte(avaliacoesPeriodicas.periodoFinal, periodoFinal));
		}

		if (dataInicial) {
			condicoes.push(gte(avaliacoesPeriodicas.dataAvaliacao, dataInicial));
		}

		if (dataFinal) {
			condicoes.push(lte(avaliacoesPeriodicas.dataAvaliacao, dataFinal));
		}

		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const avaliacoesList = await db
			.select({
				id: avaliacoesPeriodicas.id,
				funcionarioId: avaliacoesPeriodicas.funcionarioId,
				avaliadorId: avaliacoesPeriodicas.avaliadorId,
				periodoInicial: avaliacoesPeriodicas.periodoInicial,
				periodoFinal: avaliacoesPeriodicas.periodoFinal,
				dataAvaliacao: avaliacoesPeriodicas.dataAvaliacao,
				desempenho: avaliacoesPeriodicas.desempenho,
				comprometimento: avaliacoesPeriodicas.comprometimento,
				trabalhoEquipe: avaliacoesPeriodicas.trabalhoEquipe,
				lideranca: avaliacoesPeriodicas.lideranca,
				comunicacao: avaliacoesPeriodicas.comunicacao,
				inovacao: avaliacoesPeriodicas.inovacao,
				resolucaoProblemas: avaliacoesPeriodicas.resolucaoProblemas,
				qualidadeTrabalho: avaliacoesPeriodicas.qualidadeTrabalho,
				mediaFinal: avaliacoesPeriodicas.mediaFinal,
				classificacao: avaliacoesPeriodicas.classificacao,
				metasAnterior: avaliacoesPeriodicas.metasAnterior,
				avaliacaoMetas: avaliacoesPeriodicas.avaliacaoMetas,
				novasMetas: avaliacoesPeriodicas.novasMetas,
				feedbackGeral: avaliacoesPeriodicas.feedbackGeral,
				planoDesenvolvimento: avaliacoesPeriodicas.planoDesenvolvimento,
				criadoEm: avaliacoesPeriodicas.criadoEm,
				atualizadoEm: avaliacoesPeriodicas.atualizadoEm,
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
			.from(avaliacoesPeriodicas)
			.leftJoin(
				funcionarios,
				eq(avaliacoesPeriodicas.funcionarioId, funcionarios.id),
			)
			.leftJoin(users, eq(avaliacoesPeriodicas.avaliadorId, users.id))
			.where(whereClause)
			.orderBy(desc(avaliacoesPeriodicas.dataAvaliacao))
			.limit(limite)
			.offset(offset);

		const [{ total }] = await db
			.select({ total: count() })
			.from(avaliacoesPeriodicas)
			.where(whereClause);

		return {
			avaliacoes: avaliacoesList,
			total: Number(total),
		};
	}

	async buscarAvaliacaoPeriodicaPorId(id: number) {
		const avaliacao = await db.query.avaliacoesPeriodicas.findFirst({
			where: eq(avaliacoesPeriodicas.id, id),
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
		const avaliacoesList = await db.query.avaliacoesPeriodicas.findMany({
			where: eq(avaliacoesPeriodicas.funcionarioId, funcionarioId),
			with: {
				avaliador: true,
			},
			orderBy: [desc(avaliacoesPeriodicas.dataAvaliacao)],
		});

		return avaliacoesList;
	}

	async buscarAvaliacoesPorAvaliador(avaliadorId: number) {
		const avaliacoesList = await db.query.avaliacoesPeriodicas.findMany({
			where: eq(avaliacoesPeriodicas.avaliadorId, avaliadorId),
			with: {
				funcionario: {
					with: {
						cargo: true,
						departamento: true,
					},
				},
			},
			orderBy: [desc(avaliacoesPeriodicas.dataAvaliacao)],
		});

		return avaliacoesList;
	}

	async buscarAvaliacoesPorClassificacao(
		classificacao: ClassificacaoAvaliacaoPeriodicaType,
	) {
		const avaliacoesList = await db.query.avaliacoesPeriodicas.findMany({
			where: eq(avaliacoesPeriodicas.classificacao, classificacao),
			with: {
				funcionario: {
					with: {
						cargo: true,
						departamento: true,
					},
				},
				avaliador: true,
			},
			orderBy: [desc(avaliacoesPeriodicas.dataAvaliacao)],
		});

		return avaliacoesList;
	}

	async buscarUltimaAvaliacaoFuncionario(funcionarioId: number) {
		const ultimaAvaliacao = await db.query.avaliacoesPeriodicas.findFirst({
			where: eq(avaliacoesPeriodicas.funcionarioId, funcionarioId),
			with: {
				avaliador: true,
			},
			orderBy: [desc(avaliacoesPeriodicas.dataAvaliacao)],
		});

		return ultimaAvaliacao;
	}

	async buscarAvaliacoesPorPeriodo(
		periodoInicial: string,
		periodoFinal: string,
	) {
		const avaliacoesList = await db.query.avaliacoesPeriodicas.findMany({
			where: and(
				gte(avaliacoesPeriodicas.periodoInicial, periodoInicial),
				lte(avaliacoesPeriodicas.periodoFinal, periodoFinal),
			),
			with: {
				funcionario: {
					with: {
						cargo: true,
						departamento: true,
					},
				},
				avaliador: true,
			},
			orderBy: [desc(avaliacoesPeriodicas.dataAvaliacao)],
		});

		return avaliacoesList;
	}

	async atualizarAvaliacaoPeriodica(
		id: number,
		avaliacaoData: AtualizarAvaliacaoPeriodicaData,
	) {
		let dadosAtualizacao = {
			...avaliacaoData,
			atualizadoEm: new Date().toISOString(),
		};

		if (
			avaliacaoData.desempenho !== undefined ||
			avaliacaoData.comprometimento !== undefined ||
			avaliacaoData.trabalhoEquipe !== undefined ||
			avaliacaoData.lideranca !== undefined ||
			avaliacaoData.comunicacao !== undefined ||
			avaliacaoData.inovacao !== undefined ||
			avaliacaoData.resolucaoProblemas !== undefined ||
			avaliacaoData.qualidadeTrabalho !== undefined
		) {
			const avaliacaoAtual = await this.buscarAvaliacaoPeriodicaPorId(id);
			if (avaliacaoAtual) {
				const novaMedia = this.calcularMedia(
					avaliacaoData.desempenho ?? avaliacaoAtual.desempenho,
					avaliacaoData.comprometimento ?? avaliacaoAtual.comprometimento,
					avaliacaoData.trabalhoEquipe ?? avaliacaoAtual.trabalhoEquipe,
					avaliacaoData.lideranca ?? avaliacaoAtual.lideranca,
					avaliacaoData.comunicacao ?? avaliacaoAtual.comunicacao,
					avaliacaoData.inovacao ?? avaliacaoAtual.inovacao,
					avaliacaoData.resolucaoProblemas ?? avaliacaoAtual.resolucaoProblemas,
					avaliacaoData.qualidadeTrabalho ?? avaliacaoAtual.qualidadeTrabalho,
				);

				const novaClassificacao = this.determinarClassificacao(novaMedia);

				dadosAtualizacao = {
					...dadosAtualizacao,
					mediaFinal: Number(novaMedia.toFixed(2)),
					classificacao: novaClassificacao,
				};
			}
		}

		await db
			.update(avaliacoesPeriodicas)
			.set(dadosAtualizacao)
			.where(eq(avaliacoesPeriodicas.id, id));

		return await this.buscarAvaliacaoPeriodicaPorId(id);
	}

	async deletarAvaliacaoPeriodica(id: number): Promise<void> {
		await db
			.delete(avaliacoesPeriodicas)
			.where(eq(avaliacoesPeriodicas.id, id));
	}
}
