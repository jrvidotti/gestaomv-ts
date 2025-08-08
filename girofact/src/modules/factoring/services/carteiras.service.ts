import { db } from "@/db";
import { carteiras } from "../schemas";
import type {
  CreateCarteiraDto,
  UpdateCarteiraDto,
  FindCarteiraDto,
  ListCarteirasDto,
  PaginatedResponse,
} from "../dtos";
import { and, eq, like, desc, count } from "drizzle-orm";
import { NotFoundError, PreconditionFailedError } from "../errors";

export class CarteirasService {
  async create(data: CreateCarteiraDto, userId: number) {
    try {
      const [carteira] = await db
        .insert(carteiras)
        .values({
          ...data,
          userId,
        })
        .returning();

      return carteira;
    } catch (error) {
      throw new Error(
        `Erro ao criar carteira: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  async findById(data: FindCarteiraDto, userId: number) {
    const carteira = await db.query.carteiras.findFirst({
      where: and(eq(carteiras.id, data.id), eq(carteiras.userId, userId)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!carteira) {
      throw new NotFoundError("Carteira não encontrada");
    }

    return carteira;
  }

  async list(
    data: ListCarteirasDto,
    userId?: number
  ): Promise<PaginatedResponse<typeof carteiras.$inferSelect>> {
    const { page, limit, search, usuarioId } = data;
    const offset = (page - 1) * limit;

    // Construir condições de busca
    const conditions = [];

    if (usuarioId) {
      conditions.push(eq(carteiras.userId, usuarioId));
    } else if (userId) {
      // Se não especificou usuário, filtrar pelas carteiras do usuário logado
      conditions.push(eq(carteiras.userId, userId));
    }

    if (search) {
      conditions.push(like(carteiras.nome, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Buscar dados paginados
    const [data_result, total_result] = await Promise.all([
      db.query.carteiras.findMany({
        where: whereClause,
        orderBy: [desc(carteiras.criadoEm)],
        limit,
        offset,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db
        .select({ count: count() })
        .from(carteiras)
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

  async update(data: UpdateCarteiraDto, userId: number) {
    const { id, ...atualizadoEma } = data;

    // Verificar se a carteira existe e pertence ao usuário
    await this.findById({ id }, userId);

    try {
      const [updatedCarteira] = await db
        .update(carteiras)
        .set({
          ...atualizadoEma,
          atualizadoEm: new Date().toISOString(),
        })
        .where(and(eq(carteiras.id, id), eq(carteiras.userId, userId)))
        .returning();

      return updatedCarteira;
    } catch (error) {
      throw new Error(
        `Erro ao atualizar carteira: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  async delete(data: FindCarteiraDto, userId: number) {
    // Verificar se a carteira existe e pertence ao usuário
    await this.findById(data, userId);

    try {
      // TODO: Verificar se há operações vinculadas antes de deletar
      await db
        .delete(carteiras)
        .where(and(eq(carteiras.id, data.id), eq(carteiras.userId, userId)));

      return { success: true, message: "Carteira excluída com sucesso" };
    } catch (error) {
      if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
        throw new PreconditionFailedError(
          "Não é possível excluir carteira que possui operações vinculadas"
        );
      }

      throw new Error(
        `Erro ao excluir carteira: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  async listByUser(userId: number) {
    return db.query.carteiras.findMany({
      where: eq(carteiras.userId, userId),
      orderBy: [desc(carteiras.criadoEm)],
    });
  }
}
