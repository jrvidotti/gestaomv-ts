import { db } from "@/db";
import { and, asc, count, desc, eq, like, ne } from "drizzle-orm";
import type {
  CreatePessoaDto,
  FindPessoaDto,
  ListPessoasDto,
  PaginatedResponse,
  UpdatePessoaDto,
} from "../dtos";
import type { TipoPessoa } from "../enums";
import { dadosBancarios, pessoas, telefones } from "../schemas";

export class PessoasService {
  async create(data: CreatePessoaDto, userId: number) {
    return await db.transaction(async (tx) => {
      // Inserir pessoa
      const [pessoa] = await tx
        .insert(pessoas)
        .values({
          tipoPessoa: data.tipoPessoa,
          documento: data.documento.replace(/\D/g, ""), // Remove formatação
          nomeRazaoSocial: data.nomeRazaoSocial,
          nomeFantasia: data.nomeFantasia,
          dataNascimentoFundacao: data.dataNascimentoFundacao,
          inscricaoEstadual: data.inscricaoEstadual,
          inscricaoMunicipal: data.inscricaoMunicipal,
          nomeMae: data.nomeMae,
          sexo: data.sexo,
          email: data.email,
          cep: data.cep,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          observacoesGerais: data.observacoesGerais,
        })
        .returning();

      // Inserir telefones
      if (data.telefones && data.telefones.length > 0) {
        await tx.insert(telefones).values(
          data.telefones.map((telefone) => ({
            pessoaId: pessoa.id,
            numero: telefone.numero.replace(/\D/g, ""), // Remove formatação
            principal: telefone.principal,
            whatsapp: telefone.whatsapp,
            inativo: telefone.inativo,
          }))
        );
      }

      // Inserir dados bancários
      if (data.dadosBancarios && data.dadosBancarios.length > 0) {
        await tx.insert(dadosBancarios).values(
          data.dadosBancarios.map((dados) => ({
            pessoaId: pessoa.id,
            banco: dados.banco,
            agencia: dados.agencia,
            conta: dados.conta,
            digitoVerificador: dados.digitoVerificador,
            tipoConta: dados.tipoConta,
          }))
        );
      }

      return await this.findById(pessoa.id);
    });
  }

  async update(id: number, data: UpdatePessoaDto, userId: number) {
    return await db.transaction(async (tx) => {
      // Atualizar pessoa
      await tx
        .update(pessoas)
        .set({
          ...(data.tipoPessoa && { tipoPessoa: data.tipoPessoa }),
          ...(data.documento && {
            documento: data.documento.replace(/\D/g, ""),
          }),
          ...(data.nomeRazaoSocial && {
            nomeRazaoSocial: data.nomeRazaoSocial,
          }),
          nomeFantasia: data.nomeFantasia,
          dataNascimentoFundacao: data.dataNascimentoFundacao,
          inscricaoEstadual: data.inscricaoEstadual,
          inscricaoMunicipal: data.inscricaoMunicipal,
          nomeMae: data.nomeMae,
          sexo: data.sexo,
          email: data.email,
          cep: data.cep,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          observacoesGerais: data.observacoesGerais,
          updatedAt: new Date(),
        })
        .where(eq(pessoas.id, id));

      // Atualizar telefones se fornecidos
      if (data.telefones) {
        // Remove telefones existentes
        await tx.delete(telefones).where(eq(telefones.pessoaId, id));

        // Insere novos telefones
        if (data.telefones.length > 0) {
          await tx.insert(telefones).values(
            data.telefones.map((telefone) => ({
              pessoaId: id,
              numero: telefone.numero.replace(/\D/g, ""),
              principal: telefone.principal,
              whatsapp: telefone.whatsapp,
              inativo: telefone.inativo,
            }))
          );
        }
      }

      // Atualizar dados bancários se fornecidos
      if (data.dadosBancarios) {
        // Remove dados bancários existentes
        await tx.delete(dadosBancarios).where(eq(dadosBancarios.pessoaId, id));

        // Insere novos dados bancários
        if (data.dadosBancarios.length > 0) {
          await tx.insert(dadosBancarios).values(
            data.dadosBancarios.map((dados) => ({
              pessoaId: id,
              banco: dados.banco,
              agencia: dados.agencia,
              conta: dados.conta,
              digitoVerificador: dados.digitoVerificador,
              tipoConta: dados.tipoConta,
            }))
          );
        }
      }

      return await this.findById(id);
    });
  }

  async findById(id: number) {
    const pessoa = await db.query.pessoas.findFirst({
      where: eq(pessoas.id, id),
      with: {
        telefones: {
          where: eq(telefones.inativo, false),
        },
        dadosBancarios: true,
      },
    });

    if (!pessoa) {
      throw new Error("Pessoa não encontrada");
    }

    return pessoa;
  }

  async findByDocumento(documento: string) {
    const documentoLimpo = documento.replace(/\D/g, "");

    return await db.query.pessoas.findFirst({
      where: eq(pessoas.documento, documentoLimpo),
      with: {
        telefones: {
          where: eq(telefones.inativo, false),
        },
        dadosBancarios: true,
      },
    });
  }

  async list(params: ListPessoasDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, search, tipoPessoa } = params;
    const offset = (page - 1) * limit;

    // Construir condições WHERE
    const conditions = [];

    if (search) {
      conditions.push(like(pessoas.nomeRazaoSocial, `%${search}%`));
    }

    if (tipoPessoa) {
      conditions.push(eq(pessoas.tipoPessoa, tipoPessoa));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Buscar dados
    const data = await db.query.pessoas.findMany({
      where: whereCondition,
      with: {
        telefones: {
          where: eq(telefones.inativo, false),
          limit: 1,
          orderBy: [desc(telefones.principal), asc(telefones.id)],
        },
      },
      limit,
      offset,
      orderBy: [desc(pessoas.createdAt)],
    });

    // Contar total
    const [countResult] = await db
      .select({ count: pessoas.id })
      .from(pessoas)
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

  async delete(id: number) {
    // Verificar se pessoa tem relacionamentos
    const pessoa = await this.findById(id);

    // TODO: Verificar se é cliente ativo ou tem operações
    // if (pessoa.isCliente && hasActiveOperations) {
    //   throw new Error("Não é possível excluir pessoa com operações ativas");
    // }

    await db.delete(pessoas).where(eq(pessoas.id, id));

    return { success: true, message: "Pessoa excluída com sucesso" };
  }

  /**
   * Busca pessoas para autocomplete
   */
  async searchForAutocomplete(
    search: string,
    tipoPessoa?: TipoPessoa,
    limit = 10
  ) {
    const conditions = [like(pessoas.nomeRazaoSocial, `%${search}%`)];

    if (tipoPessoa) {
      conditions.push(eq(pessoas.tipoPessoa, tipoPessoa));
    }

    return await db.query.pessoas.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        nomeRazaoSocial: true,
        nomeFantasia: true,
        documento: true,
        tipoPessoa: true,
      },
      limit,
      orderBy: [asc(pessoas.nomeRazaoSocial)],
    });
  }

  /**
   * Valida se documento já existe
   */
  async documentoExists(documento: string, excludeId?: number) {
    const documentoLimpo = documento.replace(/\D/g, "");

    const conditions = [eq(pessoas.documento, documentoLimpo)];
    if (excludeId) {
      conditions.push(ne(pessoas.id, excludeId));
    }

    const pessoa = await db.query.pessoas.findFirst({
      where: and(...conditions),
      columns: { id: true },
    });

    return !!pessoa;
  }

  /**
   * Formata documento para exibição
   */
  formatarDocumento(documento: string, tipoPessoa: TipoPessoa): string {
    const nums = documento.replace(/\D/g, "");

    if (tipoPessoa === "fisica" && nums.length === 11) {
      return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    if (tipoPessoa === "juridica" && nums.length === 14) {
      return nums.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }

    return documento;
  }

  /**
   * Formata telefone para exibição
   */
  formatarTelefone(telefone: string): string {
    const nums = telefone.replace(/\D/g, "");

    if (nums.length === 11) {
      return nums.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (nums.length === 10) {
      return nums.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return telefone;
  }
}

// Instância singleton
export const pessoasService = new PessoasService();
