import { db } from "@/db";
import { anexos } from "../schemas";
import { and, eq, desc } from "drizzle-orm";
import { NotFoundError } from "../errors";

export class AnexosService {
  async criar(data: any, userId: number) {
    try {
      const [anexo] = await db
        .insert(anexos)
        .values({
          ...data,
          userId,
        })
        .returning();

      return anexo;
    } catch (error) {
      throw new Error(
        `Erro ao criar anexo: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  async listarPorCliente(clienteId: number) {
    return db.query.anexos.findMany({
      where: and(
        eq(anexos.clienteId, clienteId),
        eq(anexos.status, "ativo")
      ),
      orderBy: [desc(anexos.criadoEm)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async listarPorPessoa(pessoaId: number) {
    return db.query.anexos.findMany({
      where: and(
        eq(anexos.pessoaId, pessoaId),
        eq(anexos.status, "ativo")
      ),
      orderBy: [desc(anexos.criadoEm)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async listarPorOperacao(operacaoId: number) {
    return db.query.anexos.findMany({
      where: and(
        eq(anexos.operacaoId, operacaoId),
        eq(anexos.status, "ativo")
      ),
      orderBy: [desc(anexos.criadoEm)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async listarPorDocumento(documentoId: number) {
    return db.query.anexos.findMany({
      where: and(
        eq(anexos.documentoId, documentoId),
        eq(anexos.status, "ativo")
      ),
      orderBy: [desc(anexos.criadoEm)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async arquivar(id: number) {
    const anexo = await db.query.anexos.findFirst({
      where: eq(anexos.id, id),
    });

    if (!anexo) {
      throw new NotFoundError("Anexo não encontrado");
    }

    const [updated] = await db
      .update(anexos)
      .set({
        status: "arquivado",
        atualizadoEm: new Date().toISOString(),
      })
      .where(eq(anexos.id, id))
      .returning();

    return updated;
  }
}
