import { db } from "@/db";
import { format } from "date-fns";
import { and, count, desc, eq, like, not, or } from "drizzle-orm";
import type {
	CreatePessoaDto,
	FindPessoaDto,
	ListPessoasDto,
	PaginatedResponse,
	UpdatePessoaDto,
} from "../dtos";
import {
	ConflictError,
	NotFoundError,
	PreconditionFailedError,
	ValidationError,
} from "../errors";
import { dadosBancarios, pessoas, telefones } from "../schemas";

export class PessoasService {
	async create(data: CreatePessoaDto) {
		const {
			telefones: telefonesData,
			dadosBancarios: dadosBancariosData,
			...pessoaData
		} = data;

		// Verificar se já existe pessoa com mesmo documento
		const existingPessoa = await db.query.pessoas.findFirst({
			where: eq(pessoas.documento, pessoaData.documento),
		});

		if (existingPessoa) {
			throw new ConflictError(
				"Já existe uma pessoa cadastrada com este documento",
			);
		}

		try {
			return await db.transaction(async (tx) => {
				// Inserir pessoa
				const [pessoa] = await tx
					.insert(pessoas)
					.values({
						...pessoaData,
						dataNascimentoFundacao:
							pessoaData.dataNascimentoFundacao?.toISOString(),
					})
					.returning();

				// Inserir telefones
				if (telefonesData?.length) {
					await tx.insert(telefones).values(
						telefonesData.map((telefone) => ({
							...telefone,
							pessoaId: pessoa.id,
						})),
					);
				}

				// Inserir dados bancários
				if (dadosBancariosData?.length) {
					await tx.insert(dadosBancarios).values(
						dadosBancariosData.map((dadoBancario) => ({
							...dadoBancario,
							pessoaId: pessoa.id,
						})),
					);
				}

				return pessoa;
			});
		} catch (error) {
			throw new Error(
				`Erro ao criar pessoa: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async findById(data: FindPessoaDto) {
		const pessoa = await db.query.pessoas.findFirst({
			where: eq(pessoas.id, data.id),
			with: {
				telefones: {
					where: eq(telefones.inativo, false),
					orderBy: [desc(telefones.principal), desc(telefones.criadoEm)],
				},
				dadosBancarios: {
					orderBy: [desc(dadosBancarios.criadoEm)],
				},
			},
		});

		if (!pessoa) {
			throw new NotFoundError("Pessoa não encontrada");
		}

		// Converter string de data para Date se existir
		return {
			...pessoa,
			dataNascimentoFundacao: pessoa.dataNascimentoFundacao
				? new Date(pessoa.dataNascimentoFundacao)
				: null,
		};
	}

	async findByDocumento(documento: string) {
		const pessoa = await db.query.pessoas.findFirst({
			where: eq(pessoas.documento, documento),
			with: {
				telefones: {
					where: eq(telefones.inativo, false),
					orderBy: [desc(telefones.principal), desc(telefones.criadoEm)],
				},
				dadosBancarios: {
					orderBy: [desc(dadosBancarios.criadoEm)],
				},
			},
		});

		if (pessoa) {
			return {
				...pessoa,
				dataNascimentoFundacao: pessoa.dataNascimentoFundacao
					? new Date(pessoa.dataNascimentoFundacao)
					: null,
			};
		}

		return null;
	}

	async list(
		data: ListPessoasDto,
	): Promise<PaginatedResponse<typeof pessoas.$inferSelect>> {
		const { page, limit, search, tipoPessoa } = data;
		const offset = (page - 1) * limit;

		// Construir condições de busca
		const conditions = [];

		if (tipoPessoa) {
			conditions.push(eq(pessoas.tipoPessoa, tipoPessoa));
		}

		if (search) {
			conditions.push(
				or(
					like(pessoas.nomeRazaoSocial, `%${search}%`),
					like(pessoas.nomeFantasia, `%${search}%`),
					like(pessoas.documento, `%${search}%`),
					like(pessoas.email, `%${search}%`),
				),
			);
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Buscar dados paginados
		const [data_result, total_result] = await Promise.all([
			db.query.pessoas.findMany({
				where: whereClause,
				orderBy: [desc(pessoas.criadoEm)],
				limit,
				offset,
				with: {
					telefones: {
						where: and(
							eq(telefones.inativo, false),
							eq(telefones.principal, true),
						),
						limit: 1,
					},
				},
			}),
			db
				.select({ count: count() })
				.from(pessoas)
				.where(whereClause)
				.then((result) => result[0]?.count ?? 0),
		]);

		const totalPages = Math.ceil(total_result / limit);

		return {
			data: data_result.map((pessoa) => ({
				...pessoa,
				dataNascimentoFundacao: pessoa.dataNascimentoFundacao
					? new Date(pessoa.dataNascimentoFundacao)
					: null,
			})),
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

	async update(data: UpdatePessoaDto) {
		const {
			id,
			telefones: telefonesData,
			dadosBancarios: dadosBancariosData,
			...atualizadoEma
		} = data;

		if (!id) {
			throw new ValidationError("ID é obrigatório para atualização");
		}

		try {
			const result = await db.transaction(async (tx) => {
				// Verificar se a pessoa existe
				const pessoaExiste = await tx
					.select({ id: pessoas.id })
					.from(pessoas)
					.where(eq(pessoas.id, id));

				if (pessoaExiste.length === 0) {
					throw new NotFoundError("Pessoa não encontrada");
				}

				// Verificar se outro registro já usa o documento (se documento foi alterado)
				if (atualizadoEma.documento) {
					const existingPessoa = await tx
						.select({ id: pessoas.id })
						.from(pessoas)
						.where(
							and(
								eq(pessoas.documento, atualizadoEma.documento),
								not(eq(pessoas.id, id)),
							),
						);

					if (existingPessoa.length > 0) {
						throw new ConflictError(
							"Já existe uma pessoa cadastrada com este documento",
						);
					}
				}
				// Atualizar pessoa
				const [updatedPessoa] = await tx
					.update(pessoas)
					.set({
						...atualizadoEma,
						dataNascimentoFundacao:
							atualizadoEma.dataNascimentoFundacao instanceof Date
								? atualizadoEma.dataNascimentoFundacao.toISOString()
								: atualizadoEma.dataNascimentoFundacao || null,
						atualizadoEm: new Date().toISOString(),
					})
					.where(eq(pessoas.id, id))
					.returning();

				// Atualizar telefones se fornecidos
				if (telefonesData) {
					// Remover telefones existentes
					await tx.delete(telefones).where(eq(telefones.pessoaId, id));

					// Inserir novos telefones
					if (telefonesData.length > 0) {
						await tx.insert(telefones).values(
							telefonesData.map((telefone) => ({
								...telefone,
								pessoaId: id,
							})),
						);
					}
				}

				// Atualizar dados bancários se fornecidos
				if (dadosBancariosData) {
					// Remover dados bancários existentes
					await tx
						.delete(dadosBancarios)
						.where(eq(dadosBancarios.pessoaId, id));

					// Inserir novos dados bancários
					if (dadosBancariosData.length > 0) {
						await tx.insert(dadosBancarios).values(
							dadosBancariosData.map((dadoBancario) => ({
								...dadoBancario,
								pessoaId: id,
							})),
						);
					}
				}

				// Retornar apenas sucesso - evita problemas de serialização
				return { success: true };
			});

			// Após transação bem-sucedida, buscar pessoa completa
			return this.findById({ id });
		} catch (error) {
			throw new Error(
				`Erro ao atualizar pessoa: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async delete(data: FindPessoaDto) {
		// Verificar se a pessoa existe
		await this.findById(data);

		try {
			// TODO: Verificar se há vínculos com clientes ou outras entidades
			await db.delete(pessoas).where(eq(pessoas.id, data.id));

			return { success: true, message: "Pessoa excluída com sucesso" };
		} catch (error) {
			if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
				throw new PreconditionFailedError(
					"Não é possível excluir pessoa que possui vínculos no sistema",
				);
			}

			throw new Error(
				`Erro ao excluir pessoa: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async buscarPorCpfCnpj(documento: string) {
		// TODO: Integração com API Direct Data para buscar dados automáticos
		// Por enquanto, retorna apenas se já existe no banco
		return this.findByDocumento(documento);
	}

	async buscarCep(cep: string) {
		// TODO: Integração com ViaCEP para buscar endereço por CEP
		// Por enquanto, retorna mock para desenvolvimento
		if (!cep.match(/^\d{5}-?\d{3}$/)) {
			throw new ValidationError(
				"CEP deve ter formato válido (00000-000)",
				"cep",
			);
		}

		// Mock - substituir por integração real
		return {
			cep: cep.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2"),
			logradouro: "Rua Exemplo",
			complemento: "",
			bairro: "Centro",
			cidade: "Cidade Exemplo",
			estado: "SP",
		};
	}
}
