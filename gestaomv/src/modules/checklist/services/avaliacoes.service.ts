import type { Db } from "@/db";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { ClassificacaoNota } from "../enums";
import {
	checklistAvaliacoes,
	checklistItems,
	checklistRespostas,
	checklistTemplates,
} from "../schemas";
import type {
	ChecklistAvaliacao,
	ComparativoUnidades,
	CreateAvaliacaoData,
	RelatorioAvaliacao,
	RespostaPaginada,
} from "../types";

export class AvaliacoesService {
	constructor(private db: Db) {}

	// Classificar nota baseada na média
	classificarNota(media: number): ClassificacaoNota {
		if (media >= 4.5) return "EXCELENTE";
		if (media >= 3.5) return "BOM";
		if (media >= 2.5) return "REGULAR";
		if (media >= 1.5) return "RUIM";
		return "PESSIMO";
	}

	// Calcular média das respostas
	calcularMedia(
		respostas: Array<{ valorNota?: number | null; peso?: number }>,
	): number {
		const respostasComNota = respostas.filter(
			(r) => r.valorNota !== null && r.valorNota !== undefined,
		);

		if (respostasComNota.length === 0) return 0;

		const somaWeighted = respostasComNota.reduce(
			(acc, resp) => acc + (resp.valorNota || 0) * (resp.peso || 0),
			0,
		);
		const somaPesos = respostasComNota.reduce(
			(acc, resp) => acc + (resp.peso || 0),
			0,
		);

		return somaPesos > 0 ? somaWeighted / somaPesos : 0;
	}

	// Criar avaliação
	async criar(
		data: CreateAvaliacaoData,
		avaliadorId: number,
	): Promise<ChecklistAvaliacao> {
		return await this.db.transaction(async (tx) => {
			// Criar avaliação
			const [avaliacao] = await tx
				.insert(checklistAvaliacoes)
				.values({
					templateId: data.templateId,
					unidadeId: data.unidadeId,
					avaliadorId,
					status: "PENDENTE",
					dataAgendada: data.dataAgendada,
					observacoes: data.observacoes,
				})
				.returning();

			// Se há respostas, criar
			if (data.respostas && data.respostas.length > 0) {
				await tx.insert(checklistRespostas).values(
					data.respostas.map((resposta) => ({
						avaliacaoId: avaliacao.id,
						itemId: resposta.itemId,
						valorNota: resposta.valorNota,
						valorBoolean: resposta.valorBoolean,
						valorTexto: resposta.valorTexto,
					})),
				);

				// Se todas as respostas foram fornecidas, finalizar automaticamente
				const template = await tx.query.checklistTemplates.findFirst({
					where: eq(checklistTemplates.id, data.templateId),
					with: {
						itens: {
							where: eq(checklistItems.ativo, true),
						},
					},
				});

				if (template && data.respostas.length === template.itens.length) {
					await this.finalizarAvaliacao(avaliacao.id, tx);
				}
			}

			return avaliacao;
		});
	}

	// Finalizar avaliação e calcular média
	async finalizarAvaliacao(avaliacaoId: number, tx?: any) {
		const dbInstance = tx || this.db;

		// Buscar avaliação com template e respostas
		const avaliacao = await this.buscar(avaliacaoId);

		if (!avaliacao) throw new Error("Avaliação não encontrada");

		// Calcular média baseada apenas em itens do tipo "nota_1_5"
		const respostasComNota = avaliacao.respostas
			?.filter((resposta) => {
				const item = avaliacao.template?.itens?.find(
					(i) => i.id === resposta.itemId,
				);
				return item?.tipo === "NOTA_1_5" && resposta.valorNota;
			})
			.map((resposta) => {
				const item = avaliacao.template?.itens?.find(
					(i) => i.id === resposta.itemId,
				);
				if (!item) throw new Error("Item não encontrado");
				return {
					valorNota: resposta.valorNota,
					peso: item.peso,
				};
			});

		const mediaFinal = this.calcularMedia(respostasComNota || []);
		const classificacao = this.classificarNota(mediaFinal);

		// Atualizar avaliação
		await dbInstance
			.update(checklistAvaliacoes)
			.set({
				status: "concluida",
				dataFim: new Date().toISOString(),
				mediaFinal,
				classificacao,
				atualizadoEm: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(checklistAvaliacoes.id, avaliacaoId));

		return { mediaFinal, classificacao };
	}

	// Listar avaliações com filtros
	async listar(filtros: {
		templateId?: number;
		unidadeId?: number;
		avaliadorId?: number;
		status?: string;
		classificacao?: string;
		dataInicio?: string;
		dataFim?: string;
		pagina?: number;
		limite?: number;
	}): Promise<RespostaPaginada<ChecklistAvaliacao>> {
		const {
			templateId,
			unidadeId,
			avaliadorId,
			status,
			classificacao,
			dataInicio,
			dataFim,
			pagina = 1,
			limite = 20,
		} = filtros;

		const conditions = [];

		if (templateId)
			conditions.push(eq(checklistAvaliacoes.templateId, templateId));
		if (unidadeId)
			conditions.push(eq(checklistAvaliacoes.unidadeId, unidadeId));
		if (avaliadorId)
			conditions.push(eq(checklistAvaliacoes.avaliadorId, avaliadorId));
		if (status) conditions.push(eq(checklistAvaliacoes.status, status as any));
		if (classificacao)
			conditions.push(
				eq(checklistAvaliacoes.classificacao, classificacao as any),
			);
		if (dataInicio)
			conditions.push(gte(checklistAvaliacoes.criadoEm, dataInicio));
		if (dataFim) conditions.push(lte(checklistAvaliacoes.criadoEm, dataFim));

		const offset = (pagina - 1) * limite;

		const avaliacoes = await this.db.query.checklistAvaliacoes.findMany({
			where: conditions.length > 0 ? and(...conditions) : undefined,
			with: {
				template: true,
				unidade: {
					columns: {
						id: true,
						nome: true,
						codigo: true,
					},
				},
				avaliador: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
			orderBy: desc(checklistAvaliacoes.criadoEm),
			limit: limite,
			offset,
		});

		// Contar total
		const [{ count }] = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(checklistAvaliacoes)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		return {
			data: avaliacoes,
			total: count,
			pagina,
			limite,
			totalPaginas: Math.ceil(count / limite),
		};
	}

	// Buscar avaliação por ID
	async buscar(id: number): Promise<ChecklistAvaliacao | undefined> {
		const avaliacao = await this.db.query.checklistAvaliacoes.findFirst({
			where: eq(checklistAvaliacoes.id, id),
			with: {
				template: {
					with: {
						itens: {
							where: eq(checklistItems.ativo, true),
							orderBy: (items, { asc }) => asc(items.ordem),
						},
					},
				},
				unidade: {
					columns: {
						id: true,
						nome: true,
						codigo: true,
					},
				},
				avaliador: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				respostas: true,
			},
		});

		return avaliacao;
	}

	// Atualizar avaliação
	async atualizar(
		id: number,
		data: {
			status?: string;
			observacoes?: string;
			respostas?: Array<{
				itemId: number;
				valorNota?: number;
				valorBoolean?: boolean;
				valorTexto?: string;
				observacao?: string;
			}>;
		},
	): Promise<ChecklistAvaliacao | null> {
		return await this.db.transaction(async (tx) => {
			// Atualizar avaliação
			const [updated] = await tx
				.update(checklistAvaliacoes)
				.set({
					status: data.status as any,
					observacoes: data.observacoes,
					dataInicio:
						data.status === "em_andamento"
							? new Date().toISOString()
							: undefined,
					atualizadoEm: sql`CURRENT_TIMESTAMP`,
				})
				.where(eq(checklistAvaliacoes.id, id))
				.returning();

			if (!updated) return null;

			// Atualizar respostas se fornecidas
			if (data.respostas) {
				// Deletar respostas existentes
				await tx
					.delete(checklistRespostas)
					.where(eq(checklistRespostas.avaliacaoId, id));

				// Inserir novas respostas
				if (data.respostas.length > 0) {
					await tx.insert(checklistRespostas).values(
						data.respostas.map((resposta) => ({
							avaliacaoId: id,
							itemId: resposta.itemId,
							valorNota: resposta.valorNota,
							valorBoolean: resposta.valorBoolean,
							valorTexto: resposta.valorTexto,
							observacao: resposta.observacao,
						})),
					);
				}

				// Se status for concluida, calcular média
				if (data.status === "concluida") {
					await this.finalizarAvaliacao(id, tx);
				}
			}

			return updated;
		});
	}

	// Deletar avaliação
	async deletar(id: number): Promise<boolean> {
		const [deleted] = await this.db
			.delete(checklistAvaliacoes)
			.where(eq(checklistAvaliacoes.id, id))
			.returning();

		return !!deleted;
	}

	// Gerar relatório de avaliações
	async gerarRelatorio(filtros: {
		templateId?: number;
		unidadeId?: number;
		dataInicio?: string;
		dataFim?: string;
		agruparPor: "template" | "unidade" | "avaliador" | "mes";
	}): Promise<RelatorioAvaliacao[]> {
		// Implementação simplificada - em produção seria mais complexa
		const avaliacoes = await this.listar({
			...filtros,
			limite: 1000, // Para relatório, pegar mais registros
		});

		return avaliacoes.data.map((avaliacao) => ({
			avaliacaoId: avaliacao.id,
			templateNome: avaliacao.template?.nome || "",
			unidadeNome: avaliacao.unidade?.nome || "",
			avaliadorNome: avaliacao.avaliador?.name || "",
			dataAvaliacao: avaliacao.criadoEm || new Date().toISOString(),
			mediaFinal: avaliacao.mediaFinal || 0,
			classificacao: avaliacao.classificacao || "REGULAR",
			totalItens: 0, // Seria calculado com join
			itensRespondidos: 0, // Seria calculado com join
		}));
	}

	// Comparativo entre unidades
	async gerarComparativo(filtros: {
		templateId?: number;
		dataInicio?: string;
		dataFim?: string;
		unidadeIds?: number[];
	}): Promise<ComparativoUnidades[]> {
		// Implementação simplificada
		// Em produção, seria uma query complexa com agregações
		const avaliacoes = await this.listar({
			...filtros,
			limite: 1000,
		});

		const unidadesMap = new Map<
			number,
			{
				unidadeId: number;
				unidadeNome: string;
				avaliacoes: any[];
			}
		>();

		// Agrupar por unidade
		for (const avaliacao of avaliacoes.data) {
			const unidadeId = avaliacao.unidade?.id;
			if (unidadeId && !unidadesMap.has(unidadeId)) {
				unidadesMap.set(unidadeId, {
					unidadeId,
					unidadeNome: avaliacao.unidade?.nome || "",
					avaliacoes: [],
				});
			}
			const unidadeData = unidadeId && unidadesMap.get(unidadeId);
			if (unidadeData) {
				unidadeData.avaliacoes.push(avaliacao);
			}
		}

		// Calcular estatísticas por unidade
		const resultado: ComparativoUnidades[] = [];
		for (const [, unidadeData] of unidadesMap) {
			const avaliacoesConc = unidadeData.avaliacoes.filter(
				(a) => a.mediaFinal !== null,
			);
			const mediaGeral =
				avaliacoesConc.length > 0
					? avaliacoesConc.reduce((acc, a) => acc + a.mediaFinal, 0) /
						avaliacoesConc.length
					: 0;

			resultado.push({
				unidadeId: unidadeData.unidadeId,
				unidadeNome: unidadeData.unidadeNome,
				totalAvaliacoes: unidadeData.avaliacoes.length,
				mediaGeral,
				classificacaoGeral: this.classificarNota(mediaGeral),
				ultimaAvaliacao: unidadeData.avaliacoes[0]?.criadoEm,
				tendencia: "PRIMEIRA", // Seria calculado comparando com período anterior
			});
		}

		return resultado.sort((a, b) => b.mediaGeral - a.mediaGeral);
	}
}
