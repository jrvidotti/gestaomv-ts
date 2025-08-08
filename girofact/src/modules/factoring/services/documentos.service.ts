import type { Db } from "@/db";
import { endOfDay, format, startOfDay } from "date-fns";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import type {
	AgendaVencimentosDto,
	CompensacaoLoteDto,
	DevolucaoDto,
	ListDto,
	PagamentoDto,
	PaginatedResponse,
	PosicaoDocumentosDto,
	ProrrogacaoDto,
	ResgateDto,
} from "../dtos";
import { STATUS_DOCUMENTO, TIPO_OCORRENCIA } from "../enums";
import { NotFoundError, ValidationError } from "../errors";
import { documentos, ocorrencias, operacoes } from "../schemas";

export class DocumentosService {
	constructor(private db: Db) {}
	async compensacaoLote(data: CompensacaoLoteDto, userId: number) {
		const {
			documentos: documentosIds,
			dataOcorrencia,
			carteiraId,
			observacao,
		} = data;

		try {
			return await this.db.transaction(async (tx) => {
				const resultados = [];

				for (const { id } of documentosIds) {
					// Verificar se documento pode ser compensado
					const documento = await tx.query.documentos.findFirst({
						where: eq(documentos.id, id),
					});

					if (!documento) {
						throw new NotFoundError(`Documento ${id} não encontrado`);
					}

					if (documento.status !== STATUS_DOCUMENTO.PENDENTE) {
						throw new ValidationError(
							`Documento ${id} não pode ser compensado - status: ${documento.status}`,
						);
					}

					// Atualizar status do documento
					await tx
						.update(documentos)
						.set({
							status: STATUS_DOCUMENTO.COMPENSADO,
							atualizadoEm: new Date().toISOString(),
						})
						.where(eq(documentos.id, id));

					// Registrar ocorrência
					const [ocorrencia] = await tx
						.insert(ocorrencias)
						.values({
							documentoId: id,
							tipoOcorrencia: TIPO_OCORRENCIA.COMPENSACAO,
							dataOcorrencia: dataOcorrencia.toISOString(),
							observacao,
							userId,
						})
						.returning();

					resultados.push({ documentoId: id, ocorrenciaId: ocorrencia.id });
				}

				return { success: true, resultados };
			});
		} catch (error) {
			throw new Error(
				`Erro na compensação em lote: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async devolverDocumento(data: DevolucaoDto, userId: number) {
		const { id, alineaDevolucao, dataOcorrencia, observacao } = data;

		const documento = await db.query.documentos.findFirst({
			where: eq(documentos.id, id),
		});

		if (!documento) {
			throw new NotFoundError("Documento não encontrado");
		}

		if (
			documento.status !== STATUS_DOCUMENTO.PENDENTE &&
			documento.status !== STATUS_DOCUMENTO.COMPENSADO
		) {
			throw new ValidationError(
				"Documento não pode ser devolvido neste status",
			);
		}

		try {
			return await this.db.transaction(async (tx) => {
				// Atualizar documento
				await tx
					.update(documentos)
					.set({
						status: STATUS_DOCUMENTO.DEVOLVIDO,
						foiDevolvido: true,
						atualizadoEm: new Date().toISOString(),
					})
					.where(eq(documentos.id, id));

				// Registrar ocorrência
				const [ocorrencia] = await tx
					.insert(ocorrencias)
					.values({
						documentoId: id,
						tipoOcorrencia: TIPO_OCORRENCIA.DEVOLUCAO,
						dataOcorrencia: dataOcorrencia.toISOString(),
						alineaDevolucao,
						observacao,
						userId,
					})
					.returning();

				return ocorrencia;
			});
		} catch (error) {
			throw new Error(
				`Erro ao devolver documento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async prorrogarDocumento(data: ProrrogacaoDto, userId: number) {
		const {
			id,
			dataVencimentoProrrogada,
			valorJuros,
			valorTarifa,
			observacao,
		} = data;

		const documento = await db.query.documentos.findFirst({
			where: eq(documentos.id, id),
		});

		if (!documento) {
			throw new NotFoundError("Documento não encontrado");
		}

		try {
			return await this.db.transaction(async (tx) => {
				// Atualizar documento
				await tx
					.update(documentos)
					.set({
						dataVencimentoProrrogada: dataVencimentoProrrogada.toISOString(),
						atualizadoEm: new Date().toISOString(),
					})
					.where(eq(documentos.id, id));

				// Registrar ocorrência
				const [ocorrencia] = await tx
					.insert(ocorrencias)
					.values({
						documentoId: id,
						tipoOcorrencia: TIPO_OCORRENCIA.PRORROGACAO,
						dataOcorrencia: new Date().toISOString(),
						dataVencimentoAtual: documento.dataVencimento,
						dataVencimentoProrrogada: dataVencimentoProrrogada.toISOString(),
						valorJuros: valorJuros,
						valorTarifa: valorTarifa || 0,
						observacao,
						userId,
					})
					.returning();

				return ocorrencia;
			});
		} catch (error) {
			throw new Error(
				`Erro ao prorrogar documento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async list(data: ListDto): Promise<PaginatedResponse<any>> {
		const {
			page,
			limit,
			operacaoId,
			clienteId,
			status,
			tipoDocumento,
			dataVencimentoInicio,
			dataVencimentoFim,
			vencidosAte,
		} = data;
		const offset = (page - 1) * limit;

		const conditions = [];

		if (operacaoId) conditions.push(eq(documentos.operacaoId, operacaoId));
		if (status) conditions.push(eq(documentos.status, status));
		if (tipoDocumento)
			conditions.push(eq(documentos.tipoDocumento, tipoDocumento));
		if (dataVencimentoInicio)
			conditions.push(
				gte(documentos.dataVencimento, dataVencimentoInicio.toISOString()),
			);
		if (dataVencimentoFim)
			conditions.push(
				lte(documentos.dataVencimento, dataVencimentoFim.toISOString()),
			);
		if (vencidosAte)
			conditions.push(
				lte(documentos.dataVencimento, vencidosAte.toISOString()),
			);

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [data_result, total_result] = await Promise.all([
			db.query.documentos.findMany({
				where: whereClause,
				orderBy: [desc(documentos.dataVencimento)],
				limit,
				offset,
				with: {
					operacao: {
						with: {
							cliente: {
								with: {
									pessoa: {
										columns: {
											nomeRazaoSocial: true,
											documento: true,
										},
									},
								},
							},
						},
					},
				},
			}),
			db
				.select({ count: count() })
				.from(documentos)
				.where(whereClause)
				.then((r) => r[0]?.count ?? 0),
		]);

		return {
			data: data_result,
			pagination: {
				page,
				limit,
				total: total_result,
				totalPages: Math.ceil(total_result / limit),
				hasNext: page < Math.ceil(total_result / limit),
				hasPrev: page > 1,
			},
		};
	}

	async agendaVencimentos(data: AgendaVencimentosDto) {
		const { dataInicio, dataFim, clienteId, carteiraId, incluirFloat } = data;

		const conditions = [
			gte(documentos.dataVencimento, dataInicio.toISOString()),
			lte(documentos.dataVencimento, dataFim.toISOString()),
			eq(documentos.status, STATUS_DOCUMENTO.PENDENTE),
		];

		if (clienteId) {
			// Filtrar por cliente através da operação
		}

		const whereClause = and(...conditions);

		return db.query.documentos.findMany({
			where: whereClause,
			orderBy: [documentos.dataVencimento],
			with: {
				operacao: {
					with: {
						cliente: {
							with: {
								pessoa: {
									columns: {
										nomeRazaoSocial: true,
										documento: true,
									},
								},
							},
						},
					},
				},
			},
		});
	}

	async resgateDocumento(data: ResgateDto, userId: number) {
		const { id, dataOcorrencia, valorJuros, valorTarifa, observacao } = data;

		const documento = await db.query.documentos.findFirst({
			where: eq(documentos.id, id),
		});

		if (!documento) {
			throw new NotFoundError("Documento não encontrado");
		}

		if (
			documento.status !== STATUS_DOCUMENTO.PENDENTE &&
			documento.status !== STATUS_DOCUMENTO.COMPENSADO
		) {
			throw new ValidationError(
				"Documento não pode ser resgatado neste status",
			);
		}

		try {
			return await this.db.transaction(async (tx) => {
				// Atualizar documento
				await tx
					.update(documentos)
					.set({
						status: STATUS_DOCUMENTO.RESGATADO,
						atualizadoEm: new Date().toISOString(),
					})
					.where(eq(documentos.id, id));

				// Registrar ocorrência
				const [ocorrencia] = await tx
					.insert(ocorrencias)
					.values({
						documentoId: id,
						tipoOcorrencia: TIPO_OCORRENCIA.RESGATE,
						dataOcorrencia: dataOcorrencia.toISOString(),
						valorJuros: valorJuros || 0,
						valorTarifa: valorTarifa || 0,
						observacao,
						userId,
					})
					.returning();

				return ocorrencia;
			});
		} catch (error) {
			throw new Error(
				`Erro ao resgatar documento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async pagarDocumento(data: PagamentoDto, userId: number) {
		const { id, dataOcorrencia, valorJuros, valorTarifa, observacao } = data;

		const documento = await db.query.documentos.findFirst({
			where: eq(documentos.id, id),
		});

		if (!documento) {
			throw new NotFoundError("Documento não encontrado");
		}

		if (
			documento.status !== STATUS_DOCUMENTO.PENDENTE &&
			documento.status !== STATUS_DOCUMENTO.COMPENSADO
		) {
			throw new ValidationError("Documento não pode ser pago neste status");
		}

		try {
			return await this.db.transaction(async (tx) => {
				// Atualizar documento
				await tx
					.update(documentos)
					.set({
						status: STATUS_DOCUMENTO.PAGO,
						atualizadoEm: new Date().toISOString(),
					})
					.where(eq(documentos.id, id));

				// Registrar ocorrência
				const [ocorrencia] = await tx
					.insert(ocorrencias)
					.values({
						documentoId: id,
						tipoOcorrencia: TIPO_OCORRENCIA.PAGAMENTO,
						dataOcorrencia: dataOcorrencia.toISOString(),
						valorJuros: valorJuros || 0,
						valorTarifa: valorTarifa || 0,
						observacao,
						userId,
					})
					.returning();

				return ocorrencia;
			});
		} catch (error) {
			throw new Error(
				`Erro ao pagar documento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async posicaoDocumentos(data: PosicaoDocumentosDto) {
		const { dataReferencia, clienteId, status, agruparPor } = data;
		const dataReferenciaStr = dataReferencia.toISOString();

		const conditions = [lte(documentos.criadoEm, dataReferenciaStr)];

		if (clienteId) {
			// Será implementado com join na operação para filtrar por cliente
		}

		if (status) {
			conditions.push(eq(documentos.status, status));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Buscar todos os documentos baseado nos filtros
		const documentosResult = await db.query.documentos.findMany({
			where: whereClause,
			with: {
				operacao: {
					with: {
						cliente: {
							with: {
								pessoa: {
									columns: {
										id: true,
										nomeRazaoSocial: true,
										documento: true,
									},
								},
							},
						},
					},
				},
			},
		});

		// Agrupar dados conforme solicitado
		const agrupados = this.agruparDocumentos(
			documentosResult,
			agruparPor,
			dataReferencia,
		);

		// Calcular totais gerais
		const totais = this.calcularTotais(documentosResult);

		return {
			dataReferencia: dataReferenciaStr,
			agruparPor,
			grupos: agrupados,
			totais,
			totalDocumentos: documentosResult.length,
		};
	}

	private agruparDocumentos(
		documentos: any[],
		agruparPor: string,
		dataReferencia: Date,
	) {
		const grupos = new Map();

		documentos.forEach((doc) => {
			let chave: string;
			let label: string;

			switch (agruparPor) {
				case "status":
					chave = doc.status;
					label = this.getStatusLabel(doc.status);
					break;
				case "cliente":
					chave = doc.operacao.cliente.id.toString();
					label = doc.operacao.cliente.pessoa.nomeRazaoSocial;
					break;
				case "vencimento": {
					const diasVencimento = this.calcularDiasVencimento(
						doc.dataVencimento,
						dataReferencia,
					);
					chave = this.getFaixaVencimento(diasVencimento);
					label = chave;
					break;
				}
				default:
					chave = "todos";
					label = "Todos os documentos";
			}

			if (!grupos.has(chave)) {
				grupos.set(chave, {
					chave,
					label,
					documentos: [],
					quantidade: 0,
					valorTotal: 0,
					valorVencido: 0,
					quantidadeVencida: 0,
				});
			}

			const grupo = grupos.get(chave);
			grupo.documentos.push(doc);
			grupo.quantidade++;
			grupo.valorTotal += doc.valorDocumento;

			// Verificar se está vencido
			const isVencido = new Date(doc.dataVencimento) < dataReferencia;
			if (isVencido) {
				grupo.valorVencido += doc.valorDocumento;
				grupo.quantidadeVencida++;
			}
		});

		return Array.from(grupos.values());
	}

	private calcularTotais(documentos: any[]) {
		return documentos.reduce(
			(acc, doc) => {
				acc.valorTotal += doc.valorDocumento;
				acc.quantidadeTotal++;

				const status = doc.status;
				if (!acc.porStatus[status]) {
					acc.porStatus[status] = { quantidade: 0, valor: 0 };
				}
				acc.porStatus[status].quantidade++;
				acc.porStatus[status].valor += doc.valorDocumento;

				return acc;
			},
			{
				valorTotal: 0,
				quantidadeTotal: 0,
				porStatus: {} as Record<string, { quantidade: number; valor: number }>,
			},
		);
	}

	private getStatusLabel(status: string): string {
		const labels = {
			pendente: "Pendente",
			compensado: "Compensado",
			devolvido: "Devolvido",
			protestado: "Protestado",
			resgatado: "Resgatado",
			pago: "Pago",
		};
		return labels[status as keyof typeof labels] || status;
	}

	private calcularDiasVencimento(
		dataVencimento: string,
		dataReferencia: Date,
	): number {
		const vencimento = new Date(dataVencimento);
		const referencia = new Date(dataReferencia);
		const diffTime = referencia.getTime() - vencimento.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}

	private getFaixaVencimento(dias: number): string {
		if (dias < 0) return "A vencer";
		if (dias <= 30) return "Vencido até 30 dias";
		if (dias <= 60) return "Vencido 31-60 dias";
		if (dias <= 90) return "Vencido 61-90 dias";
		return "Vencido acima de 90 dias";
	}
}
