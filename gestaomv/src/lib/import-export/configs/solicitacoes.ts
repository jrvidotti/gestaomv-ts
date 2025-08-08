import { db } from "@/db";
import { solicitacoesMaterial, solicitacoesMaterialItens } from "@/db/schemas";
import type { ImportExportOptions } from "@/lib/import-export";

export interface SolicitacaoImport {
  solicitante: {
    email: string;
  };
  unidade: {
    codigo: number;
  };
  aprovador: {
    email: string;
  } | null;
  atendidoPor: {
    email: string;
  } | null;
  dataOperacao: string;
  dataAprovacao: string | null;
  dataAtendimento: string | null;
  status: string;
  observacoes: string | null;
  itens: {
    material: {
      tipoMaterialId: string;
      nome: string;
      unidadeMedidaId: string;
    };
    qtdSolicitada: number;
    qtdAtendida: number | null;
  }[];
}

export const config = {
  nomeArquivo: "solicitacoes",
  descricaoArquivo: "Dados de solicitacoes para seed",
  buscarItens: async () => {
    return await db.query.solicitacoesMaterial.findMany({
      columns: {
        dataOperacao: true,
        dataAprovacao: true,
        dataAtendimento: true,
        status: true,
        observacoes: true,
      },
      with: {
        solicitante: {
          columns: {
            email: true,
          },
        },
        unidade: {
          columns: {
            codigo: true,
          },
        },
        aprovador: {
          columns: {
            email: true,
          },
        },
        atendidoPor: {
          columns: {
            email: true,
          },
        },
        itens: {
          with: {
            material: {
              columns: {
                tipoMaterialId: true,
                nome: true,
                unidadeMedidaId: true,
              },
            },
          },
        },
      },
    });
  },
  importarItem: async (solicitacao) => {
    const existente = await db.query.solicitacoesMaterial.findFirst({
      where: (solicitacoesMaterial, { eq }) =>
        eq(solicitacoesMaterial.dataOperacao, solicitacao.dataOperacao),
    });

    if (existente) return false;

    const solicitante = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, solicitacao.solicitante.email),
    });
    const unidade = await db.query.unidades.findFirst({
      where: (unidades, { eq }) =>
        eq(unidades.codigo, solicitacao.unidade.codigo),
    });
    const aprovador = solicitacao.aprovador?.email
      ? await db.query.users.findFirst({
          where: (users, { eq }) =>
            eq(users.email, solicitacao.aprovador?.email || ""),
        })
      : null;
    const atendidoPor = solicitacao.atendidoPor?.email
      ? await db.query.users.findFirst({
          where: (users, { eq }) =>
            eq(users.email, solicitacao.atendidoPor?.email || ""),
        })
      : null;

    const result = await db
      .insert(solicitacoesMaterial)
      .values({
        unidadeId: unidade?.id || 0,
        solicitanteId: solicitante?.id || 0,
        aprovadorId: aprovador?.id || null,
        atendidoPorId: atendidoPor?.id || null,
        dataOperacao: solicitacao.dataOperacao,
        dataAprovacao: solicitacao.dataAprovacao,
        dataAtendimento: solicitacao.dataAtendimento,
        status: solicitacao.status as any,
        observacoes: solicitacao.observacoes,
      })
      .onConflictDoNothing();

    if (result.lastInsertRowid) {
      for (const item of solicitacao.itens) {
        const material = await db.query.materiais.findFirst({
          where: (materiais, { eq, and }) =>
            and(
              eq(materiais.nome, item.material.nome),
              eq(materiais.tipoMaterialId, item.material.tipoMaterialId),
              eq(materiais.unidadeMedidaId, item.material.unidadeMedidaId)
            ),
        });

        await db.insert(solicitacoesMaterialItens).values({
          solicitacaoMaterialId: result.lastInsertRowid as number,
          materialId: material?.id || 0,
          qtdSolicitada: item.qtdSolicitada,
          qtdAtendida: item.qtdAtendida,
        });
      }
    }

    return result.changes > 0;
  },
} satisfies ImportExportOptions<SolicitacaoImport>;
