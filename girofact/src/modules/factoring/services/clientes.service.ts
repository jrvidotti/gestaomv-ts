import { db } from "@/db";
import { and, asc, count, desc, eq, like, ne, sum } from "drizzle-orm";
import type {
	AnaliseCreditoDto,
	CreateClienteDto,
	FindClienteDto,
	HistoricoLimiteDto,
	ListClientesDto,
	PaginatedResponse,
	UpdateClienteDto,
} from "../dtos";
import type { StatusCliente } from "../enums";
import { clientes, contatosReferencia, pessoas, telefones } from "../schemas";
import { pessoasService } from "./pessoas.service";

export class ClientesService {
	async create(data: CreateClienteDto, userId: number) {
		// Verificar se pessoa existe
		const pessoa = await pessoasService.findById(data.pessoaId);
		if (!pessoa) {
			throw new Error("Pessoa não encontrada");
		}

		// Verificar se já é cliente
		const clienteExistente = await db.query.clientes.findFirst({
			where: eq(clientes.pessoaId, data.pessoaId),
		});

		if (clienteExistente) {
			throw new Error("Esta pessoa já é um cliente");
		}

		return await db.transaction(async (tx) => {
			// Inserir cliente
			const [cliente] = await tx
				.insert(clientes)
				.values({
					pessoaId: data.pessoaId,
					status: data.status,
					observacoesCliente: data.observacoesCliente,
					creditoAutorizado: data.creditoAutorizado,
					limiteCredito: data.limiteCredito,
					taxaJurosPadrao: data.taxaJurosPadrao,
					tarifaDevolucaoCheques: data.tarifaDevolucaoCheques,
					tarifaProrrogacao: data.tarifaProrrogacao,
					dataUltimaAnaliseCredito: data.dataUltimaAnaliseCredito || new Date(),
					usuarioResponsavelAnalise: data.usuarioResponsavelAnalise || userId,
					historicoAlteracoesLimite: JSON.stringify([
						{
							data: new Date(),
							limiteAnterior: 0,
							novoLimite: data.limiteCredito,
							usuario: userId.toString(),
							motivo: "Cadastro inicial do cliente",
						},
					]),
				})
				.returning();

			// Inserir contatos de referência
			if (data.contatosReferencia && data.contatosReferencia.length > 0) {
				await tx.insert(contatosReferencia).values(
					data.contatosReferencia.map((contato) => ({
						clienteId: cliente.id,
						tipoReferencia: contato.tipoReferencia,
						pessoaId: contato.pessoaId,
						nomeCompleto: contato.nomeCompleto,
						telefone: contato.telefone.replace(/\D/g, ""),
						email: contato.email,
						documento: contato.documento?.replace(/\D/g, ""),
						empresaOrganizacao: contato.empresaOrganizacao,
						cargoFuncao: contato.cargoFuncao,
						observacoes: contato.observacoes,
					})),
				);
			}

			return await this.findById(cliente.id);
		});
	}

	async update(id: number, data: UpdateClienteDto, userId: number) {
		const cliente = await this.findById(id);
		if (!cliente) {
			throw new Error("Cliente não encontrado");
		}

		return await db.transaction(async (tx) => {
			// Preparar histórico de alterações de limite
			let novoHistorico = cliente.historicoAlteracoesLimite;
			if (
				data.limiteCredito !== undefined &&
				data.limiteCredito !== cliente.limiteCredito
			) {
				const historico: HistoricoLimiteDto[] =
					cliente.historicoAlteracoesLimite
						? JSON.parse(cliente.historicoAlteracoesLimite)
						: [];

				historico.push({
					data: new Date(),
					limiteAnterior: cliente.limiteCredito,
					novoLimite: data.limiteCredito,
					usuario: userId.toString(),
					motivo: "Alteração manual do limite",
				});

				novoHistorico = JSON.stringify(historico);
			}

			// Atualizar cliente
			await tx
				.update(clientes)
				.set({
					status: data.status,
					observacoesCliente: data.observacoesCliente,
					creditoAutorizado: data.creditoAutorizado,
					limiteCredito: data.limiteCredito,
					taxaJurosPadrao: data.taxaJurosPadrao,
					tarifaDevolucaoCheques: data.tarifaDevolucaoCheques,
					tarifaProrrogacao: data.tarifaProrrogacao,
					dataUltimaAnaliseCredito: data.dataUltimaAnaliseCredito,
					usuarioResponsavelAnalise: data.usuarioResponsavelAnalise || userId,
					historicoAlteracoesLimite: novoHistorico,
					updatedAt: new Date(),
				})
				.where(eq(clientes.id, id));

			// Atualizar contatos de referência se fornecidos
			if (data.contatosReferencia) {
				// Remove contatos existentes
				await tx
					.delete(contatosReferencia)
					.where(eq(contatosReferencia.clienteId, id));

				// Insere novos contatos
				if (data.contatosReferencia.length > 0) {
					await tx.insert(contatosReferencia).values(
						data.contatosReferencia.map((contato) => ({
							clienteId: id,
							tipoReferencia: contato.tipoReferencia,
							pessoaId: contato.pessoaId,
							nomeCompleto: contato.nomeCompleto,
							telefone: contato.telefone.replace(/\D/g, ""),
							email: contato.email,
							documento: contato.documento?.replace(/\D/g, ""),
							empresaOrganizacao: contato.empresaOrganizacao,
							cargoFuncao: contato.cargoFuncao,
							observacoes: contato.observacoes,
						})),
					);
				}
			}

			return await this.findById(id);
		});
	}

	async findById(id: number) {
		const cliente = await db.query.clientes.findFirst({
			where: eq(clientes.id, id),
			with: {
				pessoa: {
					with: {
						telefones: {
							where: eq(telefones.inativo, false),
						},
						dadosBancarios: true,
					},
				},
				contatosReferencia: {
					with: {
						pessoa: {
							columns: {
								id: true,
								nomeRazaoSocial: true,
								documento: true,
								tipoPessoa: true,
							},
						},
					},
				},
				usuarioResponsavel: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!cliente) {
			throw new Error("Cliente não encontrado");
		}

		return {
			...cliente,
			historicoAlteracoesLimite: cliente.historicoAlteracoesLimite
				? JSON.parse(cliente.historicoAlteracoesLimite)
				: [],
		};
	}

	async findByPessoaId(pessoaId: number) {
		return await db.query.clientes.findFirst({
			where: eq(clientes.pessoaId, pessoaId),
			with: {
				pessoa: true,
				contatosReferencia: true,
			},
		});
	}

	async list(params: ListClientesDto): Promise<PaginatedResponse<any>> {
		const { page = 1, limit = 20, search, status, creditoAutorizado } = params;
		const offset = (page - 1) * limit;

		// Construir condições WHERE
		const conditions = [];

		if (search) {
			// Busca por nome da pessoa
			conditions.push(like(pessoas.nomeRazaoSocial, `%${search}%`));
		}

		if (status) {
			conditions.push(eq(clientes.status, status));
		}

		if (creditoAutorizado !== undefined) {
			conditions.push(eq(clientes.creditoAutorizado, creditoAutorizado));
		}

		const whereCondition =
			conditions.length > 0 ? and(...conditions) : undefined;

		// Buscar dados com JOIN
		const data = await db.query.clientes.findMany({
			where: whereCondition,
			with: {
				pessoa: {
					columns: {
						id: true,
						nomeRazaoSocial: true,
						nomeFantasia: true,
						documento: true,
						tipoPessoa: true,
						email: true,
						cidade: true,
						estado: true,
					},
					with: {
						telefones: {
							where: eq(telefones.inativo, false),
							limit: 1,
							orderBy: [desc(telefones.principal), asc(telefones.id)],
						},
					},
				},
			},
			limit,
			offset,
			orderBy: [desc(clientes.createdAt)],
		});

		// Contar total - precisa fazer JOIN manual
		const [countResult] = await db
			.select({ count: clientes.id })
			.from(clientes)
			.innerJoin(pessoas, eq(clientes.pessoaId, pessoas.id))
			.where(whereCondition);

		const total = countResult?.count || 0;
		const totalPages = Math.ceil(total / limit);

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		};
	}

	async realizarAnaliseCredito(data: AnaliseCreditoDto, userId: number) {
		const cliente = await this.findById(data.clienteId);
		if (!cliente) {
			throw new Error("Cliente não encontrado");
		}

		const historico: HistoricoLimiteDto[] =
			cliente.historicoAlteracoesLimite || [];

		historico.push({
			data: new Date(),
			limiteAnterior: cliente.limiteCredito,
			novoLimite: data.novoLimite,
			usuario: userId.toString(),
			motivo: data.observacoes || "Análise de crédito",
		});

		await db
			.update(clientes)
			.set({
				limiteCredito: data.novoLimite,
				creditoAutorizado: data.creditoAutorizado,
				taxaJurosPadrao: data.taxaJurosPadrao,
				dataUltimaAnaliseCredito: new Date(),
				usuarioResponsavelAnalise: userId,
				historicoAlteracoesLimite: JSON.stringify(historico),
				updatedAt: new Date(),
			})
			.where(eq(clientes.id, data.clienteId));

		return await this.findById(data.clienteId);
	}

	/**
	 * Busca clientes para autocomplete
	 */
	async searchForAutocomplete(
		search: string,
		status?: StatusCliente,
		limit = 10,
	) {
		const conditions = [like(pessoas.nomeRazaoSocial, `%${search}%`)];

		if (status) {
			conditions.push(eq(clientes.status, status));
		}

		return await db.query.clientes.findMany({
			where: and(...conditions),
			with: {
				pessoa: {
					columns: {
						id: true,
						nomeRazaoSocial: true,
						nomeFantasia: true,
						documento: true,
						tipoPessoa: true,
					},
				},
			},
			columns: {
				id: true,
				limiteCredito: true,
				creditoAutorizado: true,
				status: true,
			},
			limit,
			orderBy: [asc(pessoas.nomeRazaoSocial)],
		});
	}

	/**
	 * Calcula limite disponível do cliente
	 */
	async calcularLimiteDisponivel(clienteId: number): Promise<number> {
		const cliente = await this.findById(clienteId);
		if (!cliente.creditoAutorizado) {
			return 0;
		}

		// TODO: Calcular valor em operações pendentes
		// const operacoesPendentes = await db.query.operacoes.findMany({
		//   where: and(
		//     eq(operacoes.clienteId, clienteId),
		//     eq(operacoes.status, "pendente")
		//   ),
		//   columns: { valorLiquido: true },
		// });

		// const valorUtilizado = operacoesPendentes.reduce(
		//   (total, op) => total + op.valorLiquido,
		//   0
		// );

		const valorUtilizado = 0; // Temporário até implementar operações
		return Math.max(0, cliente.limiteCredito - valorUtilizado);
	}

	/**
	 * Obtém estatísticas de clientes
	 */
	async obterEstatisticas() {
		const [total] = await db.select({ count: count() }).from(clientes);
		const [ativos] = await db
			.select({ count: count() })
			.from(clientes)
			.where(eq(clientes.status, "ativo"));
		const [comCredito] = await db
			.select({ count: count() })
			.from(clientes)
			.where(eq(clientes.creditoAutorizado, true));
		const [limiteResult] = await db
			.select({ total: sum(clientes.limiteCredito) })
			.from(clientes);

		return {
			total: total.count,
			ativos: ativos.count,
			comCredito: comCredito.count,
			limiteTotal: limiteResult.total || 0,
		};
	}

	async delete(id: number) {
		// Verificar se cliente tem operações
		// TODO: Implementar verificação de operações ativas

		await db.delete(clientes).where(eq(clientes.id, id));

		return { success: true, message: "Cliente excluído com sucesso" };
	}
}

// Instância singleton
export const clientesService = new ClientesService();
