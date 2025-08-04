import { Injectable } from '@nestjs/common';
import { eq, and, desc, sql, count, SQLWrapper } from 'drizzle-orm';
import { getDatabase } from '../database/database';
import {
  solicitacoesMaterial,
  solicitacoesMaterialItens,
  AtenderSolicitacaoData,
  AtualizarSolicitacaoData,
  CriarSolicitacaoMaterialData,
  FiltrosSolicitacoes,
  STATUS_SOLICITACAO_ARRAY,
  STATUS_SOLICITACAO,
  StatusSolicitacaoType,
} from '@/shared';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SolicitacoesService {
  private notificationsService: NotificationsService;

  constructor() {
    this.notificationsService = new NotificationsService();
  }

  private get db() {
    return getDatabase();
  }

  async criarSolicitacaoMaterial(solicitanteId: number, solicitacaoData: CriarSolicitacaoMaterialData) {
    const [solicitacao] = await this.db
      .insert(solicitacoesMaterial)
      .values({
        solicitanteId,
        unidadeId: solicitacaoData.unidadeId,
        dataOperacao: new Date().toISOString(),
        status: STATUS_SOLICITACAO.PENDENTE,
        observacoes: solicitacaoData.observacoes,
      })
      .returning();

    if (solicitacaoData.itens.length > 0) {
      await this.db.insert(solicitacoesMaterialItens).values(
        solicitacaoData.itens.map((item) => ({
          solicitacaoMaterialId: solicitacao.id,
          materialId: item.materialId,
          qtdSolicitada: item.qtdSolicitada,
        })),
      );
    }

    // Buscar solicitação completa para notificação
    const solicitacaoCompleta = await this.buscarSolicitacaoMaterialPorId(solicitacao.id);
    if (solicitacaoCompleta) {
      // Enviar notificação assíncrona para aprovadores (não esperar para não travar o response)
      this.notificationsService
        .notificarSolicitacaoCriada(solicitacaoCompleta, solicitacaoCompleta.itens || [])
        .catch((error) => {
          console.error('Erro ao enviar notificação de solicitação criada:', error);
        });
    }

    return solicitacao;
  }

  async listarSolicitacoesMaterial(filtros?: FiltrosSolicitacoes) {
    const { status, unidadeId, solicitanteId, dataInicial, dataFinal, pagina = 1, limite = 20 } = filtros || {};
    const offset = (pagina - 1) * limite;

    const condicoes: SQLWrapper[] = [];

    if (status && STATUS_SOLICITACAO_ARRAY.includes(status)) {
      condicoes.push(eq(solicitacoesMaterial.status, status as StatusSolicitacaoType));
    }

    if (unidadeId) {
      condicoes.push(eq(solicitacoesMaterial.unidadeId, unidadeId));
    }

    if (solicitanteId) {
      condicoes.push(eq(solicitacoesMaterial.solicitanteId, solicitanteId));
    }

    if (dataInicial) {
      condicoes.push(sql`${solicitacoesMaterial.dataOperacao} >= ${dataInicial}`);
    }

    if (dataFinal) {
      condicoes.push(sql`${solicitacoesMaterial.dataOperacao} <= ${dataFinal}`);
    }

    const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

    const solicitacoesList = await this.db.query.solicitacoesMaterial.findMany({
      where: whereClause,
      with: {
        solicitante: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        unidade: {
          columns: {
            id: true,
            nome: true,
          },
        },
        aprovador: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        atendidoPor: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        itens: {
          with: {
            material: {
              with: {
                tipoMaterial: true,
                unidadeMedida: true,
              },
            },
          },
        },
      },
      orderBy: [desc(solicitacoesMaterial.criadoEm)],
      limit: limite,
      offset,
    });

    const [{ total }] = await this.db.select({ total: count() }).from(solicitacoesMaterial).where(whereClause);

    return {
      solicitacoes: solicitacoesList,
      total: Number(total),
    };
  }

  async buscarSolicitacaoMaterialPorId(id: number) {
    const solicitacao = await this.db.query.solicitacoesMaterial.findFirst({
      where: eq(solicitacoesMaterial.id, id),
      with: {
        solicitante: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        unidade: {
          columns: {
            id: true,
            nome: true,
          },
        },
        aprovador: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        atendidoPor: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        itens: {
          with: {
            material: {
              with: {
                tipoMaterial: true,
                unidadeMedida: true,
              },
            },
          },
        },
      },
    });

    return solicitacao;
  }

  async aprovarOuRejeitarSolicitacao(id: number, dadosAprovacao: AtualizarSolicitacaoData, aprovadorId?: number) {
    const agora = new Date().toISOString();

    await this.db
      .update(solicitacoesMaterial)
      .set({
        status: dadosAprovacao.status,
        aprovadorId,
        dataAprovacao: agora,
        atualizadoEm: agora,
      })
      .where(eq(solicitacoesMaterial.id, id));

    // Se aprovando, definir qtdAtendida = qtdSolicitada para itens onde qtdAtendida for null
    if (dadosAprovacao.status === STATUS_SOLICITACAO.APROVADA) {
      await this.db
        .update(solicitacoesMaterialItens)
        .set({
          qtdAtendida: sql`COALESCE(${solicitacoesMaterialItens.qtdAtendida}, ${solicitacoesMaterialItens.qtdSolicitada})`,
          atualizadoEm: agora,
        })
        .where(eq(solicitacoesMaterialItens.solicitacaoMaterialId, id));
    }

    if (dadosAprovacao.itens) {
      for (const item of dadosAprovacao.itens) {
        await this.db
          .update(solicitacoesMaterialItens)
          .set({
            qtdAtendida: item.qtdAtendida,
            atualizadoEm: agora,
          })
          .where(eq(solicitacoesMaterialItens.id, item.id));
      }
    }

    // Buscar solicitação completa para notificação
    const solicitacaoCompleta = await this.buscarSolicitacaoMaterialPorId(id);
    if (solicitacaoCompleta) {
      // Enviar notificações assíncronas baseadas no status
      if (dadosAprovacao.status === STATUS_SOLICITACAO.APROVADA) {
        this.notificationsService
          .notificarSolicitacaoAprovada(solicitacaoCompleta, solicitacaoCompleta.itens || [])
          .catch((error) => {
            console.error('Erro ao enviar notificação de solicitação aprovada:', error);
          });
      } else if (dadosAprovacao.status === STATUS_SOLICITACAO.REJEITADA) {
        this.notificationsService
          .notificarSolicitacaoRejeitada(
            solicitacaoCompleta,
            solicitacaoCompleta.itens || [],
            dadosAprovacao.motivoRejeicao,
          )
          .catch((error) => {
            console.error('Erro ao enviar notificação de solicitação rejeitada:', error);
          });
      }
    }

    return solicitacaoCompleta;
  }

  async cancelarSolicitacao(id: number, solicitanteId: number) {
    const agora = new Date().toISOString();

    // Verificar se a solicitação existe e está pendente
    const solicitacao = await this.db.query.solicitacoesMaterial.findFirst({
      where: and(
        eq(solicitacoesMaterial.id, id),
        eq(solicitacoesMaterial.solicitanteId, solicitanteId),
        eq(solicitacoesMaterial.status, STATUS_SOLICITACAO.PENDENTE),
      ),
    });

    if (!solicitacao) {
      throw new Error('Solicitação não encontrada ou não pode ser cancelada');
    }

    await this.db
      .update(solicitacoesMaterial)
      .set({
        status: STATUS_SOLICITACAO.CANCELADA,
        atualizadoEm: agora,
      })
      .where(eq(solicitacoesMaterial.id, id));

    return await this.buscarSolicitacaoMaterialPorId(id);
  }

  async atualizarQtdAtendida(itemId: number, qtdAtendida: number, podeReduzir: boolean = true) {
    const agora = new Date().toISOString();

    // Se não pode reduzir, buscar quantidade atual para validação
    if (!podeReduzir) {
      const itemAtual = await this.db.query.solicitacoesMaterialItens.findFirst({
        where: eq(solicitacoesMaterialItens.id, itemId),
      });

      if (!itemAtual) {
        throw new Error('Item da solicitação não encontrado');
      }

      const qtdAtual = itemAtual.qtdAtendida ?? itemAtual.qtdSolicitada;
      if (qtdAtendida > qtdAtual) {
        throw new Error('Gerentes de almoxarifado só podem reduzir a quantidade atendida');
      }
    }

    await this.db
      .update(solicitacoesMaterialItens)
      .set({
        qtdAtendida,
        atualizadoEm: agora,
      })
      .where(eq(solicitacoesMaterialItens.id, itemId));

    return { success: true };
  }

  async atenderSolicitacao(id: number, dadosAtendimento: AtenderSolicitacaoData & { atendidoPorId: number }) {
    const agora = new Date().toISOString();

    await this.db
      .update(solicitacoesMaterial)
      .set({
        status: STATUS_SOLICITACAO.ATENDIDA,
        atendidoPorId: dadosAtendimento.atendidoPorId,
        dataAtendimento: agora,
        atualizadoEm: agora,
      })
      .where(eq(solicitacoesMaterial.id, id));

    for (const item of dadosAtendimento.itens) {
      await this.db
        .update(solicitacoesMaterialItens)
        .set({
          qtdAtendida: item.qtdAtendida,
          atualizadoEm: agora,
        })
        .where(eq(solicitacoesMaterialItens.id, item.id));
    }

    return await this.buscarSolicitacaoMaterialPorId(id);
  }
}
