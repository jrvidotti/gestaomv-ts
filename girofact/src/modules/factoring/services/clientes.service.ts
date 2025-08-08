import { db } from "@/db";
import { clientes, contatosReferencia, pessoas } from "../schemas";
import type {
  CreateClienteDto,
  UpdateClienteDto,
  FindClienteDto,
  ListClientesDto,
  AnaliseCreditoDto,
  HistoricoLimiteDto,
  PaginatedResponse,
} from "../dtos";
import { and, eq, like, desc, count, or } from "drizzle-orm";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  PreconditionFailedError,
} from "../errors";
import { format } from "date-fns";

export class ClientesService {
  async create(data: CreateClienteDto, userId: number) {
    const { contatosReferencia: contatosData, ...clienteData } = data;

    // Verificar se a pessoa existe
    const pessoa = await db.query.pessoas.findFirst({
      where: eq(pessoas.id, data.pessoaId),
    });

    if (!pessoa) {
      throw new NotFoundError("Pessoa não encontrada");
    }

    // Verificar se já existe cliente para esta pessoa
    const existingCliente = await db.query.clientes.findFirst({
      where: eq(clientes.pessoaId, data.pessoaId),
    });

    if (existingCliente) {
      throw new ConflictError(
        "Já existe um cliente cadastrado para esta pessoa"
      );
    }

    // Validar se há pelo menos uma referência
    if (!contatosData || contatosData.length === 0) {
      throw new ValidationError(
        "Pelo menos uma referência deve ser cadastrada"
      );
    }

    try {
      return await db.transaction(async (tx) => {
        // Inserir cliente
        const [cliente] = await tx
          .insert(clientes)
          .values({
            ...clienteData,
            dataUltimaAnaliseCredito: new Date().toISOString(),
            usuarioResponsavelAnalise: userId,
            historicoAlteracoesLimite: [
              {
                data: new Date(),
                limiteAnterior: 0,
                novoLimite: clienteData.limiteCredito,
                usuario: `Usuário ${userId}`,
                motivo: "Cadastro inicial do cliente",
              },
            ],
          })
          .returning();

        // Inserir contatos de referência
        if (contatosData.length > 0) {
          await tx.insert(contatosReferencia).values(
            contatosData.map((contato) => ({
              ...contato,
              tipoReferencia: contato.tipoReferencia,
              clienteId: cliente.id,
            }))
          );
        }

        return cliente;
      });
    } catch (error) {
      throw new Error(
        `Erro ao criar cliente: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  async findById(data: FindClienteDto) {
    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.id, data.id),
      with: {
        pessoa: {
          with: {
            telefones: {
              where: eq(pessoas.telefones.inativo, false),
            },
            dadosBancarios: true,
          },
        },
        usuarioResponsavel: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        contatosReferencia: {
          with: {
            pessoa: {
              columns: {
                id: true,
                nomeRazaoSocial: true,
                documento: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundError("Cliente não encontrado");
    }

    // Converter strings de data para Date
    return {
      ...cliente,
      dataUltimaAnaliseCredito: cliente.dataUltimaAnaliseCredito
        ? new Date(cliente.dataUltimaAnaliseCredito)
        : null,
      pessoa: {
        ...cliente.pessoa,
        dataNascimentoFundacao: cliente.pessoa.dataNascimentoFundacao
          ? new Date(cliente.pessoa.dataNascimentoFundacao)
          : null,
      },
    };
  }

  async list(data: ListClientesDto): Promise<PaginatedResponse<any>> {
    const { page, limit, search, status, creditoAutorizado } = data;
    const offset = (page - 1) * limit;

    // Construir condições de busca
    const conditions = [];

    if (status) {
      conditions.push(eq(clientes.status, status));
    }

    if (typeof creditoAutorizado === "boolean") {
      conditions.push(eq(clientes.creditoAutorizado, creditoAutorizado));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Query base com joins
    let query = db
      .select({
        cliente: clientes,
        pessoa: {
          id: pessoas.id,
          nomeRazaoSocial: pessoas.nomeRazaoSocial,
          nomeFantasia: pessoas.nomeFantasia,
          documento: pessoas.documento,
          tipoPessoa: pessoas.tipoPessoa,
          email: pessoas.email,
        },
      })
      .from(clientes)
      .innerJoin(pessoas, eq(clientes.pessoaId, pessoas.id))
      .where(whereClause);

    // Adicionar busca se fornecida
    if (search) {
      query = query.where(
        and(
          whereClause,
          or(
            like(pessoas.nomeRazaoSocial, `%${search}%`),
            like(pessoas.nomeFantasia, `%${search}%`),
            like(pessoas.documento, `%${search}%`),
            like(pessoas.email, `%${search}%`)
          )
        )
      );
    }

    // Buscar dados paginados e total
    const [data_result, total_result] = await Promise.all([
      query.orderBy(desc(clientes.criadoEm)).limit(limit).offset(offset),
      db
        .select({ count: count() })
        .from(clientes)
        .innerJoin(pessoas, eq(clientes.pessoaId, pessoas.id))
        .where(
          search
            ? and(
                whereClause,
                or(
                  like(pessoas.nomeRazaoSocial, `%${search}%`),
                  like(pessoas.nomeFantasia, `%${search}%`),
                  like(pessoas.documento, `%${search}%`),
                  like(pessoas.email, `%${search}%`)
                )
              )
            : whereClause
        )
        .then((result) => result[0]?.count ?? 0),
    ]);

    const totalPages = Math.ceil(total_result / limit);

    return {
      data: data_result.map((row) => ({
        ...row.cliente,
        pessoa: row.pessoa,
        dataUltimaAnaliseCredito: row.cliente.dataUltimaAnaliseCredito
          ? new Date(row.cliente.dataUltimaAnaliseCredito)
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

  async update(data: UpdateClienteDto, userId: number) {
    const { id, contatosReferencia: contatosData, ...atualizadoEma } = data;

    if (!id) {
      throw new ValidationError("ID é obrigatório para atualização");
    }

    // Verificar se o cliente existe
    const clienteExistente = await this.findById({ id });

    try {
      return await db.transaction(async (tx) => {
        // Atualizar cliente
        const [updatedCliente] = await tx
          .update(clientes)
          .set({
            ...atualizadoEma,
            atualizadoEm: new Date().toISOString(),
          })
          .where(eq(clientes.id, id))
          .returning();

        // Atualizar contatos de referência se fornecidos
        if (contatosData) {
          // Remover contatos existentes
          await tx
            .delete(contatosReferencia)
            .where(eq(contatosReferencia.clienteId, id));

          // Inserir novos contatos
          if (contatosData.length > 0) {
            await tx.insert(contatosReferencia).values(
              contatosData.map((contato) => ({
                ...contato,
                clienteId: id,
              }))
            );
          }
        }

        return updatedCliente;
      });
    } catch (error) {
      throw new Error(
        `Erro ao atualizar cliente: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  async delete(data: FindClienteDto) {
    // Verificar se o cliente existe
    await this.findById(data);

    try {
      // TODO: Verificar se há operações vinculadas antes de deletar
      await db.delete(clientes).where(eq(clientes.id, data.id));

      return { success: true, message: "Cliente excluído com sucesso" };
    } catch (error) {
      if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
        throw new PreconditionFailedError(
          "Não é possível excluir cliente que possui operações vinculadas"
        );
      }

      throw new Error(
        `Erro ao excluir cliente: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  async analisarCredito(data: AnaliseCreditoDto, userId: number) {
    const {
      clienteId,
      novoLimite,
      creditoAutorizado,
      taxaJurosPadrao,
      observacoes,
    } = data;

    // Verificar se o cliente existe
    const cliente = await this.findById({ id: clienteId });

    const limiteAnterior = cliente.limiteCredito;

    // Preparar histórico de alteração
    const novaEntradaHistorico: HistoricoLimiteDto = {
      data: new Date(),
      limiteAnterior,
      novoLimite,
      usuario: `Usuário ${userId}`,
      motivo: observacoes || "Análise de crédito",
    };

    const historicoAtualizado = [
      ...(cliente.historicoAlteracoesLimite || []),
      novaEntradaHistorico,
    ];

    try {
      const [updatedCliente] = await db
        .update(clientes)
        .set({
          limiteCredito: novoLimite,
          creditoAutorizado,
          taxaJurosPadrao,
          dataUltimaAnaliseCredito: new Date().toISOString(),
          usuarioResponsavelAnalise: userId,
          historicoAlteracoesLimite: historicoAtualizado,
          observacoesCliente: observacoes
            ? `${cliente.observacoesCliente || ""}\n${format(new Date(), "dd/MM/yyyy")}: ${observacoes}`.trim()
            : cliente.observacoesCliente,
          atualizadoEm: new Date().toISOString(),
        })
        .where(eq(clientes.id, clienteId))
        .returning();

      return updatedCliente;
    } catch (error) {
      throw new Error(
        `Erro ao analisar crédito: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  async obterLimiteDisponivel(clienteId: number): Promise<number> {
    const cliente = await this.findById({ id: clienteId });

    if (!cliente.creditoAutorizado) {
      return 0;
    }

    // TODO: Implementar cálculo considerando operações em aberto
    // Por enquanto, retorna o limite total
    return cliente.limiteCredito;
  }

  async buscarClientesComLimiteDisponivel(limiteMinimo: number = 0) {
    return db.query.clientes.findMany({
      where: and(
        eq(clientes.creditoAutorizado, true)
        // TODO: Adicionar condição para limite disponível > limiteMinimo
      ),
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
      orderBy: [desc(clientes.limiteCredito)],
    });
  }

  async obterEstatisticasCliente(clienteId: number) {
    // Verificar se o cliente existe
    await this.findById({ id: clienteId });

    // TODO: Implementar estatísticas do cliente
    // - Total de operações realizadas
    // - Valor total operado
    // - Taxa de inadimplência
    // - Histórico de pagamentos

    return {
      totalOperacoes: 0,
      valorTotalOperado: 0,
      taxaInadimplencia: 0,
      ultimaOperacao: null,
      scoreInterno: "A", // Mock
    };
  }
}
