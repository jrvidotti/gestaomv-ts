import { db } from "@/db";
import { and, count, desc, eq, gte, like, lte } from "drizzle-orm";
import { calculosFinanceiros } from ".";
import type {
	CancelarOperacaoDto,
	EfetivarOperacaoDto,
	FindOperacaoDto,
	LiquidarOperacaoDto,
	ListOperacoesDto,
	PaginatedResponse,
	RemoveDocumentoDto,
	UpsertDocumentoDto,
	UpsertOperacaoDto,
} from "../dtos";
import { STATUS_DOCUMENTO, STATUS_OPERACAO } from "../enums";
import {
	NotFoundError,
	PreconditionFailedError,
	ValidationError,
} from "../errors";
import { clientes, documentos, operacoes } from "../schemas";

export class OperacoesService {
	async upsertOperacao(data: UpsertOperacaoDto, userId: number) {
		const { uid, clienteId, taxaJuros, observacoes } = data;

		// Verificar se cliente existe e tem crédito autorizado
		const cliente = await db.query.clientes.findFirst({
			where: eq(clientes.id, clienteId),
		});

		if (!cliente) {
			throw new NotFoundError("Cliente não encontrado");
		}

		if (!cliente.creditoAutorizado) {
			throw new ValidationError("Cliente não possui crédito autorizado");
		}

		try {
			// Verificar se operação já existe (upsert)
			const operacaoExistente = await db.query.operacoes.findFirst({
				where: eq(operacoes.uid, uid),
			});

			if (operacaoExistente) {
				// Atualizar operação existente (apenas se status = rascunho)
				if (operacaoExistente.status !== STATUS_OPERACAO.RASCUNHO) {
					throw new ValidationError(
						"Operação só pode ser alterada quando em rascunho",
					);
				}

				const [updated] = await db
					.update(operacoes)
					.set({
						taxaJuros,
						observacoes,
						atualizadoEm: new Date().toISOString(),
					})
					.where(eq(operacoes.uid, uid))
					.returning();

				return updated;
			}
			// Criar nova operação
			const [novaOperacao] = await db
				.insert(operacoes)
				.values({
					uid,
					clienteId,
					taxaJuros,
					observacoes,
					status: STATUS_OPERACAO.RASCUNHO,
					userId,
				})
				.returning();

			return novaOperacao;
		} catch (error) {
			throw new Error(
				`Erro ao salvar operação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async upsertDocumento(data: UpsertDocumentoDto, userId: number) {
		const { uidOperacao, uidDocumento, ...documentoData } = data;

		// Verificar se operação existe e está em rascunho
		const operacao = await db.query.operacoes.findFirst({
			where: eq(operacoes.uid, uidOperacao),
		});

		if (!operacao) {
			throw new NotFoundError("Operação não encontrada");
		}

		if (operacao.status !== STATUS_OPERACAO.RASCUNHO) {
			throw new ValidationError(
				"Documentos só podem ser alterados em operações rascunho",
			);
		}

		try {
			// Verificar se documento já existe (upsert)
			const documentoExistente = await db.query.documentos.findFirst({
				where: eq(documentos.uid, uidDocumento),
			});

			if (documentoExistente) {
				// Atualizar documento existente
				const [updated] = await db
					.update(documentos)
					.set({
						...documentoData,
						dataVencimento: documentoData.dataVencimento.toISOString(),
						atualizadoEm: new Date().toISOString(),
					})
					.where(eq(documentos.uid, uidDocumento))
					.returning();

				return updated;
			}
			// Criar novo documento
			const [novoDocumento] = await db
				.insert(documentos)
				.values({
					uid: uidDocumento,
					operacaoId: operacao.id,
					...documentoData,
					dataVencimento: documentoData.dataVencimento.toISOString(),
					status: STATUS_DOCUMENTO.PENDENTE,
				})
				.returning();

			return novoDocumento;
		} catch (error) {
			throw new Error(
				`Erro ao salvar documento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async removeDocumento(data: RemoveDocumentoDto) {
		const { uidOperacao, uidDocumento } = data;

		// Verificar se operação está em rascunho
		const operacao = await db.query.operacoes.findFirst({
			where: eq(operacoes.uid, uidOperacao),
		});

		if (!operacao) {
			throw new NotFoundError("Operação não encontrada");
		}

		if (operacao.status !== STATUS_OPERACAO.RASCUNHO) {
			throw new ValidationError(
				"Documentos só podem ser removidos de operações rascunho",
			);
		}

		try {
			await db.delete(documentos).where(eq(documentos.uid, uidDocumento));
			return { success: true, message: "Documento removido com sucesso" };
		} catch (error) {
			throw new Error(
				`Erro ao remover documento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async efetivarOperacao(data: EfetivarOperacaoDto, userId: number) {
		const { uid, status } = data;

		const operacao = await db.query.operacoes.findFirst({
			where: eq(operacoes.uid, uid),
			with: {
				documentos: true,
				cliente: true,
			},
		});

		if (!operacao) {
			throw new NotFoundError("Operação não encontrada");
		}

		// Validar transições de status
		if (
			status === STATUS_OPERACAO.APROVACAO &&
			operacao.status !== STATUS_OPERACAO.RASCUNHO
		) {
			throw new ValidationError(
				"Operação deve estar em rascunho para solicitar aprovação",
			);
		}

		if (
			status === STATUS_OPERACAO.EFETIVADA &&
			![STATUS_OPERACAO.RASCUNHO, STATUS_OPERACAO.APROVACAO].includes(
				operacao.status as any,
			)
		) {
			throw new ValidationError("Status inválido para efetivar operação");
		}

		// Verificar se há documentos
		if (!operacao.documentos.length) {
			throw new ValidationError("Operação deve ter pelo menos um documento");
		}

		// Calcular valor líquido
		const valorTotalDocumentos = operacao.documentos.reduce(
			(total, doc) => total + doc.valorDocumento,
			0,
		);

		let valorTotalJuros = 0;
		for (const doc of operacao.documentos) {
			const diasOperacao = calculosFinanceiros.calcularDias(
				operacao.criadoEm || "",
				doc.dataVencimento,
				doc.float,
			);

			const juros = calculosFinanceiros.calcularJuros(
				doc.valorDocumento,
				operacao.taxaJuros,
				diasOperacao,
			);

			valorTotalJuros += juros;
		}

		const valorLiquido = valorTotalDocumentos - valorTotalJuros;

		// Verificar limite de crédito
		if (valorLiquido > operacao.cliente.limiteCredito) {
			throw new ValidationError(
				"Valor da operação excede o limite de crédito do cliente",
			);
		}

		try {
			const atualizadoEma: any = {
				status,
				valorLiquido,
				atualizadoEm: new Date().toISOString(),
			};

			if (status === STATUS_OPERACAO.APROVACAO) {
				atualizadoEma.usuarioAprovadorId = userId;
				atualizadoEma.dataAprovacao = new Date().toISOString();
			}

			const [updated] = await db
				.update(operacoes)
				.set(atualizadoEma)
				.where(eq(operacoes.uid, uid))
				.returning();

			return updated;
		} catch (error) {
			throw new Error(
				`Erro ao efetivar operação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async cancelarOperacao(data: CancelarOperacaoDto) {
		const { uid, observacoes } = data;

		const operacao = await db.query.operacoes.findFirst({
			where: eq(operacoes.uid, uid),
			with: {
				documentos: true,
			},
		});

		if (!operacao) {
			throw new NotFoundError("Operação não encontrada");
		}

		if (operacao.status === STATUS_OPERACAO.LIQUIDADA) {
			throw new ValidationError("Operação liquidada não pode ser cancelada");
		}

		// Verificar se há documentos compensados
		const documentosCompensados = operacao.documentos.some(
			(doc) => doc.status === STATUS_DOCUMENTO.COMPENSADO,
		);

		if (documentosCompensados) {
			throw new PreconditionFailedError(
				"Não é possível cancelar operação com documentos compensados",
			);
		}

		try {
			const [updated] = await db
				.update(operacoes)
				.set({
					status: STATUS_OPERACAO.CANCELADA,
					observacoes: observacoes
						? `${operacao.observacoes || ""}\nCancelamento: ${observacoes}`.trim()
						: operacao.observacoes,
					atualizadoEm: new Date().toISOString(),
				})
				.where(eq(operacoes.uid, uid))
				.returning();

			return updated;
		} catch (error) {
			throw new Error(
				`Erro ao cancelar operação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async liquidarOperacao(data: LiquidarOperacaoDto) {
		const { uid, dataPagamento, carteiraId, observacoes } = data;

		const operacao = await db.query.operacoes.findFirst({
			where: eq(operacoes.uid, uid),
		});

		if (!operacao) {
			throw new NotFoundError("Operação não encontrada");
		}

		if (operacao.status !== STATUS_OPERACAO.EFETIVADA) {
			throw new ValidationError(
				"Apenas operações efetivadas podem ser liquidadas",
			);
		}

		try {
			const [updated] = await db
				.update(operacoes)
				.set({
					status: STATUS_OPERACAO.LIQUIDADA,
					dataPagamento: dataPagamento.toISOString(),
					carteiraId,
					observacoes: observacoes
						? `${operacao.observacoes || ""}\nLiquidação: ${observacoes}`.trim()
						: operacao.observacoes,
					atualizadoEm: new Date().toISOString(),
				})
				.where(eq(operacoes.uid, uid))
				.returning();

			return updated;
		} catch (error) {
			throw new Error(
				`Erro ao liquidar operação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async findByUid(data: FindOperacaoDto) {
		const operacao = await db.query.operacoes.findFirst({
			where: eq(operacoes.uid, data.uid),
			with: {
				cliente: {
					with: {
						pessoa: true,
					},
				},
				carteira: true,
				user: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				usuarioAprovador: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				documentos: {
					orderBy: [desc(documentos.dataVencimento)],
				},
			},
		});

		if (!operacao) {
			throw new NotFoundError("Operação não encontrada");
		}

		return {
			...operacao,
			dataAprovacao: operacao.dataAprovacao
				? new Date(operacao.dataAprovacao)
				: null,
			dataPagamento: operacao.dataPagamento
				? new Date(operacao.dataPagamento)
				: null,
		};
	}

	async list(data: ListOperacoesDto): Promise<PaginatedResponse<any>> {
		const {
			page,
			limit,
			search,
			clienteId,
			carteiraId,
			status,
			dataInicio,
			dataFim,
			usuarioId,
		} = data;
		const offset = (page - 1) * limit;

		// Construir condições de busca
		const conditions = [];

		if (clienteId) {
			conditions.push(eq(operacoes.clienteId, clienteId));
		}

		if (carteiraId) {
			conditions.push(eq(operacoes.carteiraId, carteiraId));
		}

		if (status) {
			conditions.push(eq(operacoes.status, status));
		}

		if (usuarioId) {
			conditions.push(eq(operacoes.userId, usuarioId));
		}

		if (dataInicio) {
			conditions.push(gte(operacoes.criadoEm, dataInicio.toISOString()));
		}

		if (dataFim) {
			conditions.push(lte(operacoes.criadoEm, dataFim.toISOString()));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Buscar dados paginados
		const [data_result, total_result] = await Promise.all([
			db.query.operacoes.findMany({
				where: whereClause,
				orderBy: [desc(operacoes.criadoEm)],
				limit,
				offset,
				with: {
					cliente: {
						with: {
							pessoa: {
								columns: {
									id: true,
									nomeRazaoSocial: true,
									nomeFantasia: true,
									documento: true,
								},
							},
						},
					},
					carteira: {
						columns: {
							id: true,
							nome: true,
						},
					},
				},
			}),
			db
				.select({ count: count() })
				.from(operacoes)
				.where(whereClause)
				.then((result) => result[0]?.count ?? 0),
		]);

		const totalPages = Math.ceil(total_result / limit);

		return {
			data: data_result,
			pagination: {
				page,
				limit,
				total: total_result,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		};
	}
}
