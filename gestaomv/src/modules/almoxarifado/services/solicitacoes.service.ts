import { db } from "@/db";
import { solicitacoesMaterial, solicitacoesMaterialItens } from "@/db/schemas";
import type {
	AtenderSolicitacaoData,
	AtualizarSolicitacaoData,
	CriarSolicitacaoMaterialData,
	FiltrosSolicitacoes,
} from "@/modules/almoxarifado/dtos";
import {
	STATUS_SOLICITACAO,
	STATUS_SOLICITACAO_ARRAY,
} from "@/modules/almoxarifado/enums";
import type {
	SolicitacaoMaterial,
	StatusSolicitacaoType,
} from "@/modules/almoxarifado/types";
import { notificationsService } from "@/modules/core/services/notifications.service";
import { type SQLWrapper, and, count, desc, eq, sql } from "drizzle-orm";

export class SolicitacoesService {
	async criarSolicitacaoMaterial(
		solicitanteId: number,
		solicitacaoData: CriarSolicitacaoMaterialData,
	): Promise<SolicitacaoMaterial | undefined> {
		const [solicitacao] = await db
			.insert(solicitacoesMaterial)
			.values({
				solicitanteId,
				unidadeId: solicitacaoData.unidadeId,
				dataOperacao: new Date().toISOString(),
				status: STATUS_SOLICITACAO.PENDENTE,
				observacoes: solicitacaoData.observacoes,
			})
			.returning();

		if (solicitacaoData.itens.length > 0) {
			await db.insert(solicitacoesMaterialItens).values(
				solicitacaoData.itens.map((item) => ({
					solicitacaoMaterialId: solicitacao.id,
					materialId: item.materialId,
					qtdSolicitada: item.qtdSolicitada,
				})),
			);
		}

		// Buscar solicitação completa para notificação
		const solicitacaoCompleta = await this.buscarSolicitacaoMaterialPorId(
			solicitacao.id,
		);
		if (solicitacaoCompleta) {
			// Enviar notificação assíncrona para aprovadores (não esperar para não travar o response)
			notificationsService
				.notificarSolicitacaoCriada(
					solicitacaoCompleta,
					solicitacaoCompleta.itens || [],
				)
				.catch((error) => {
					console.error(
						"Erro ao enviar notificação de solicitação criada:",
						error,
					);
				});
		}

		return solicitacao;
	}

	async listarSolicitacoesMaterial(filtros?: FiltrosSolicitacoes): Promise<{
		solicitacoes: SolicitacaoMaterial[];
		total: number;
	}> {
		const {
			status,
			unidadeId,
			solicitanteId,
			dataInicial,
			dataFinal,
			pagina = 1,
			limite = 20,
		} = filtros || {};
		const offset = (pagina - 1) * limite;

		const condicoes: SQLWrapper[] = [];

		if (status && STATUS_SOLICITACAO_ARRAY.includes(status)) {
			condicoes.push(
				eq(solicitacoesMaterial.status, status as StatusSolicitacaoType),
			);
		}

		if (unidadeId) {
			condicoes.push(eq(solicitacoesMaterial.unidadeId, unidadeId));
		}

		if (solicitanteId) {
			condicoes.push(eq(solicitacoesMaterial.solicitanteId, solicitanteId));
		}

		if (dataInicial) {
			condicoes.push(
				sql`${solicitacoesMaterial.dataOperacao} >= ${dataInicial}`,
			);
		}

		if (dataFinal) {
			condicoes.push(sql`${solicitacoesMaterial.dataOperacao} <= ${dataFinal}`);
		}

		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const solicitacoesList = await db.query.solicitacoesMaterial.findMany({
			where: whereClause,
			with: {
				solicitante: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				unidade: {
					columns: {
						id: true,
						nome: true,
					},
				},
				aprovador: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				atendidoPor: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				itens: {
					with: {
						material: {
							with: {
								tipoMaterial: true,
								unidadeMedida: true,
							},
						},
					},
				},
			},
			orderBy: [desc(solicitacoesMaterial.criadoEm)],
			limit: limite,
			offset,
		});

		const [{ total }] = await db
			.select({ total: count() })
			.from(solicitacoesMaterial)
			.where(whereClause);

		return {
			solicitacoes: solicitacoesList,
			total: Number(total),
		};
	}

	async buscarSolicitacaoMaterialPorId(
		id: number,
	): Promise<SolicitacaoMaterial | undefined> {
		const solicitacao = await db.query.solicitacoesMaterial.findFirst({
			where: eq(solicitacoesMaterial.id, id),
			with: {
				solicitante: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				unidade: {
					columns: {
						id: true,
						nome: true,
					},
				},
				aprovador: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				atendidoPor: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				itens: {
					with: {
						material: {
							with: {
								tipoMaterial: true,
								unidadeMedida: true,
							},
						},
					},
				},
			},
		});

		return solicitacao;
	}

	async aprovarOuRejeitarSolicitacao(
		id: number,
		dadosAprovacao: AtualizarSolicitacaoData,
		aprovadorId?: number,
	): Promise<SolicitacaoMaterial | undefined> {
		const agora = new Date().toISOString();

		await db
			.update(solicitacoesMaterial)
			.set({
				status: dadosAprovacao.status,
				aprovadorId,
				dataAprovacao: agora,
				atualizadoEm: agora,
			})
			.where(eq(solicitacoesMaterial.id, id));

		// Se aprovando, definir qtdAtendida = qtdSolicitada para itens onde qtdAtendida for null
		if (dadosAprovacao.status === STATUS_SOLICITACAO.APROVADA) {
			await db
				.update(solicitacoesMaterialItens)
				.set({
					qtdAtendida: sql`COALESCE(${solicitacoesMaterialItens.qtdAtendida}, ${solicitacoesMaterialItens.qtdSolicitada})`,
					atualizadoEm: agora,
				})
				.where(eq(solicitacoesMaterialItens.solicitacaoMaterialId, id));
		}

		if (dadosAprovacao.itens) {
			for (const item of dadosAprovacao.itens) {
				await db
					.update(solicitacoesMaterialItens)
					.set({
						qtdAtendida: item.qtdAtendida,
						atualizadoEm: agora,
					})
					.where(eq(solicitacoesMaterialItens.id, item.id));
			}
		}

		// Buscar solicitação completa para notificação
		const solicitacaoCompleta = await this.buscarSolicitacaoMaterialPorId(id);
		if (solicitacaoCompleta) {
			// Enviar notificações assíncronas baseadas no status
			if (dadosAprovacao.status === STATUS_SOLICITACAO.APROVADA) {
				notificationsService
					.notificarSolicitacaoAprovada(
						solicitacaoCompleta,
						solicitacaoCompleta.itens || [],
					)
					.catch((error) => {
						console.error(
							"Erro ao enviar notificação de solicitação aprovada:",
							error,
						);
					});
			} else if (dadosAprovacao.status === STATUS_SOLICITACAO.REJEITADA) {
				notificationsService
					.notificarSolicitacaoRejeitada(
						solicitacaoCompleta,
						solicitacaoCompleta.itens || [],
						dadosAprovacao.motivoRejeicao,
					)
					.catch((error) => {
						console.error(
							"Erro ao enviar notificação de solicitação rejeitada:",
							error,
						);
					});
			}
		}

		return solicitacaoCompleta;
	}

	async cancelarSolicitacao(
		id: number,
		solicitanteId: number,
	): Promise<SolicitacaoMaterial | undefined> {
		const agora = new Date().toISOString();

		// Verificar se a solicitação existe e está pendente
		const solicitacao = await db.query.solicitacoesMaterial.findFirst({
			where: and(
				eq(solicitacoesMaterial.id, id),
				eq(solicitacoesMaterial.solicitanteId, solicitanteId),
				eq(solicitacoesMaterial.status, STATUS_SOLICITACAO.PENDENTE),
			),
		});

		if (!solicitacao) {
			throw new Error("Solicitação não encontrada ou não pode ser cancelada");
		}

		await db
			.update(solicitacoesMaterial)
			.set({
				status: STATUS_SOLICITACAO.CANCELADA,
				atualizadoEm: agora,
			})
			.where(eq(solicitacoesMaterial.id, id));

		return await this.buscarSolicitacaoMaterialPorId(id);
	}

	async atualizarQtdAtendida(
		itemId: number,
		qtdAtendida: number,
		podeReduzir = true,
	) {
		const agora = new Date().toISOString();

		// Se não pode reduzir, buscar quantidade atual para validação
		if (!podeReduzir) {
			const itemAtual = await db.query.solicitacoesMaterialItens.findFirst({
				where: eq(solicitacoesMaterialItens.id, itemId),
			});

			if (!itemAtual) {
				throw new Error("Item da solicitação não encontrado");
			}

			const qtdAtual = itemAtual.qtdAtendida ?? itemAtual.qtdSolicitada;
			if (qtdAtendida > qtdAtual) {
				throw new Error(
					"Gerentes de almoxarifado só podem reduzir a quantidade atendida",
				);
			}
		}

		await db
			.update(solicitacoesMaterialItens)
			.set({
				qtdAtendida,
				atualizadoEm: agora,
			})
			.where(eq(solicitacoesMaterialItens.id, itemId));

		return { success: true };
	}

	async atenderSolicitacao(
		id: number,
		dadosAtendimento: AtenderSolicitacaoData & { atendidoPorId: number },
	): Promise<SolicitacaoMaterial | undefined> {
		const agora = new Date().toISOString();

		await db
			.update(solicitacoesMaterial)
			.set({
				status: STATUS_SOLICITACAO.ATENDIDA,
				atendidoPorId: dadosAtendimento.atendidoPorId,
				dataAtendimento: agora,
				atualizadoEm: agora,
			})
			.where(eq(solicitacoesMaterial.id, id));

		for (const item of dadosAtendimento.itens) {
			await db
				.update(solicitacoesMaterialItens)
				.set({
					qtdAtendida: item.qtdAtendida,
					atualizadoEm: agora,
				})
				.where(eq(solicitacoesMaterialItens.id, item.id));
		}

		return await this.buscarSolicitacaoMaterialPorId(id);
	}
}

export const solicitacoesService = new SolicitacoesService();
