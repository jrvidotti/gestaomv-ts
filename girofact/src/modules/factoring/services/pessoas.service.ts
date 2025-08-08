import type { Db } from "@/db";
import type { DirectDataService } from "@/modules/consultas/services/directdata.service";
import type { ViaCepService } from "@/modules/consultas/services/viacep.service";
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
	constructor(
		private db: Db,
		private directDataService: DirectDataService,
		private viaCepService: ViaCepService,
	) {}

	async create(data: CreatePessoaDto) {
		const {
			telefones: telefonesData,
			dadosBancarios: dadosBancariosData,
			...pessoaData
		} = data;

		// Verificar se já existe pessoa com mesmo documento
		const existingPessoa = await this.db.query.pessoas.findFirst({
			where: eq(pessoas.documento, pessoaData.documento),
		});

		if (existingPessoa) {
			throw new ConflictError(
				"Já existe uma pessoa cadastrada com este documento",
			);
		}

		try {
			// Inserir pessoa
			const [pessoa] = await this.db
				.insert(pessoas)
				.values({
					...pessoaData,
					dataNascimentoFundacao:
						pessoaData.dataNascimentoFundacao?.toISOString(),
				})
				.returning();

			// Inserir telefones
			if (telefonesData?.length) {
				await this.db.insert(telefones).values(
					telefonesData.map((telefone) => ({
						...telefone,
						pessoaId: pessoa.id,
					})),
				);
			}

			// Inserir dados bancários
			if (dadosBancariosData?.length) {
				await this.db.insert(dadosBancarios).values(
					dadosBancariosData.map((dadoBancario) => ({
						...dadoBancario,
						pessoaId: pessoa.id,
					})),
				);
			}

			return pessoa;
		} catch (error) {
			throw new Error(
				`Erro ao criar pessoa: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async findById(data: FindPessoaDto) {
		const pessoa = await this.db.query.pessoas.findFirst({
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
		const pessoa = await this.db.query.pessoas.findFirst({
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
			this.db.query.pessoas.findMany({
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
			this.db
				.select({ count: count() })
				.from(pessoas)
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

	async update(data: UpdatePessoaDto) {
		const {
			id,
			telefones: telefonesData,
			dadosBancarios: dadosBancariosData,
			...input
		} = data;

		if (!id) {
			throw new ValidationError("ID é obrigatório para atualização");
		}

		// Verificar se a pessoa existe
		const pessoaExiste = await this.db.query.pessoas.findFirst({
			where: eq(pessoas.id, id),
		});

		if (!pessoaExiste) {
			throw new NotFoundError("Pessoa não encontrada");
		}

		// Verificar se outro registro já usa o documento (se documento foi alterado)
		if (input.documento) {
			const existingPessoa = await this.db
				.select({ id: pessoas.id })
				.from(pessoas)
				.where(
					and(eq(pessoas.documento, input.documento), not(eq(pessoas.id, id))),
				);

			if (existingPessoa.length > 0) {
				throw new ConflictError(
					"Já existe uma pessoa cadastrada com este documento",
				);
			}
		}

		// Atualizar pessoa
		await this.db
			.update(pessoas)
			.set({
				...input,
				dataNascimentoFundacao:
					input.dataNascimentoFundacao instanceof Date
						? input.dataNascimentoFundacao.toISOString()
						: input.dataNascimentoFundacao || null,
				atualizadoEm: new Date().toISOString(),
			})
			.where(eq(pessoas.id, id));

		// Atualizar telefones se fornecidos
		if (telefonesData) {
			// Remover telefones existentes
			await this.db.delete(telefones).where(eq(telefones.pessoaId, id));

			// Inserir novos telefones
			if (telefonesData.length > 0) {
				await this.db.insert(telefones).values(
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
			await this.db
				.delete(dadosBancarios)
				.where(eq(dadosBancarios.pessoaId, id));

			// Inserir novos dados bancários
			if (dadosBancariosData.length > 0) {
				await this.db.insert(dadosBancarios).values(
					dadosBancariosData.map((dadoBancario) => ({
						...dadoBancario,
						pessoaId: id,
					})),
				);
			}
		}

		return await this.findById({ id });
	}

	async delete(data: FindPessoaDto) {
		// Verificar se a pessoa existe
		await this.findById(data);

		try {
			// TODO: Verificar se há vínculos com clientes ou outras entidades
			await this.db.delete(pessoas).where(eq(pessoas.id, data.id));

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
		// Primeiro, verificar se já existe no banco local
		const pessoaExistente = await this.findByDocumento(documento);
		if (pessoaExistente) {
			return {
				fonte: "banco_local" as const,
				dados: pessoaExistente,
			};
		}

		// Limpar documento (remover caracteres não numéricos)
		const documentoLimpo = documento.replace(/\D/g, "");

		// Detectar tipo de documento e usar método apropriado
		if (documentoLimpo.length === 11) {
			// CPF (11 dígitos)
			return await this.directDataService.consultarCpf(documento);
		}
		if (documentoLimpo.length === 14) {
			// CNPJ (14 dígitos)
			return await this.directDataService.consultarCnpj(documento);
		}
		// Documento inválido
		return {
			fonte: "erro" as const,
			dados: null,
			erro: "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)",
		};
	}

	async buscarCep(cep: string) {
		// Usar o service de consultas injetado
		return await this.viaCepService.consultarCep(cep);
	}
}
