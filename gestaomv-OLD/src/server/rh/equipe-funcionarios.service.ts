import { Injectable } from '@nestjs/common';
import { eq, and, sql, count, asc } from 'drizzle-orm';
import { getDatabase } from '../database/database';
import {
  equipeFuncionarios,
  funcionarios,
  equipes,
  AdicionarFuncionarioEquipeData,
  AtualizarEquipeFuncionarioData,
  FiltrosEquipeFuncionarios,
} from '@/shared';

export type CriarEquipeFuncionarioData = AdicionarFuncionarioEquipeData;

@Injectable()
export class EquipeFuncionariosService {
  private get db() {
    return getDatabase();
  }

  async adicionarFuncionarioEquipe(equipeFuncionarioData: CriarEquipeFuncionarioData) {
    const [equipeFuncionario] = await this.db
      .insert(equipeFuncionarios)
      .values({
        ...equipeFuncionarioData,
        ehLider: equipeFuncionarioData.ehLider || false,
      })
      .returning();

    return equipeFuncionario;
  }

  async listarEquipeFuncionarios(filtros?: FiltrosEquipeFuncionarios) {
    const { funcionarioId, equipeId, ehLider, pagina = 1, limite = 20 } = filtros || {};
    const offset = (pagina - 1) * limite;

    const condicoes = [];

    if (funcionarioId) {
      condicoes.push(eq(equipeFuncionarios.funcionarioId, funcionarioId));
    }

    if (equipeId) {
      condicoes.push(eq(equipeFuncionarios.equipeId, equipeId));
    }

    if (ehLider !== undefined) {
      condicoes.push(eq(equipeFuncionarios.ehLider, ehLider));
    }

    const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

    const equipeFuncionariosList = await this.db
      .select({
        id: equipeFuncionarios.id,
        funcionarioId: equipeFuncionarios.funcionarioId,
        equipeId: equipeFuncionarios.equipeId,
        ehLider: equipeFuncionarios.ehLider,
        criadoEm: equipeFuncionarios.criadoEm,
        atualizadoEm: equipeFuncionarios.atualizadoEm,
        funcionario: {
          id: funcionarios.id,
          nome: funcionarios.nome,
          cpf: funcionarios.cpf,
          email: funcionarios.email,
        },
        equipe: {
          id: equipes.id,
          nome: equipes.nome,
          codigo: equipes.codigo,
        },
      })
      .from(equipeFuncionarios)
      .leftJoin(funcionarios, eq(equipeFuncionarios.funcionarioId, funcionarios.id))
      .leftJoin(equipes, eq(equipeFuncionarios.equipeId, equipes.id))
      .where(whereClause)
      .orderBy(asc(funcionarios.nome))
      .limit(limite)
      .offset(offset);

    const [{ total }] = await this.db.select({ total: count() }).from(equipeFuncionarios).where(whereClause);

    return {
      equipeFuncionarios: equipeFuncionariosList,
      total: Number(total),
    };
  }

  async buscarEquipeFuncionarioPorId(id: number) {
    const equipeFuncionario = await this.db.query.equipeFuncionarios.findFirst({
      where: eq(equipeFuncionarios.id, id),
      with: {
        funcionario: {
          with: {
            cargo: true,
            departamento: true,
          },
        },
        equipe: true,
      },
    });

    return equipeFuncionario;
  }

  async buscarFuncionariosPorEquipe(equipeId: number) {
    const funcionariosList = await this.db.query.equipeFuncionarios.findMany({
      where: eq(equipeFuncionarios.equipeId, equipeId),
      with: {
        funcionario: {
          with: {
            cargo: true,
            departamento: true,
          },
        },
      },
      orderBy: [asc(equipeFuncionarios.ehLider), asc(funcionarios.nome)],
    });

    return funcionariosList;
  }

  async buscarEquipesPorFuncionario(funcionarioId: string) {
    const equipesList = await this.db.query.equipeFuncionarios.findMany({
      where: eq(equipeFuncionarios.funcionarioId, funcionarioId),
      with: {
        equipe: true,
      },
      orderBy: [asc(equipes.nome)],
    });

    return equipesList;
  }

  async buscarLideresDaEquipe(equipeId: number) {
    const lideres = await this.db.query.equipeFuncionarios.findMany({
      where: and(eq(equipeFuncionarios.equipeId, equipeId), eq(equipeFuncionarios.ehLider, true)),
      with: {
        funcionario: {
          with: {
            cargo: true,
            departamento: true,
          },
        },
      },
      orderBy: [asc(funcionarios.nome)],
    });

    return lideres;
  }

  async verificarFuncionarioNaEquipe(funcionarioId: string, equipeId: number): Promise<boolean> {
    const vinculo = await this.db.query.equipeFuncionarios.findFirst({
      where: and(eq(equipeFuncionarios.funcionarioId, funcionarioId), eq(equipeFuncionarios.equipeId, equipeId)),
    });

    return !!vinculo;
  }

  async verificarEhLiderDaEquipe(funcionarioId: string, equipeId: number): Promise<boolean> {
    const vinculo = await this.db.query.equipeFuncionarios.findFirst({
      where: and(
        eq(equipeFuncionarios.funcionarioId, funcionarioId),
        eq(equipeFuncionarios.equipeId, equipeId),
        eq(equipeFuncionarios.ehLider, true),
      ),
    });

    return !!vinculo;
  }

  async atualizarEquipeFuncionario(id: number, equipeFuncionarioData: AtualizarEquipeFuncionarioData) {
    const dadosAtualizacao = {
      ...equipeFuncionarioData,
      atualizadoEm: new Date().toISOString(),
    };

    await this.db.update(equipeFuncionarios).set(dadosAtualizacao).where(eq(equipeFuncionarios.id, id));

    return await this.buscarEquipeFuncionarioPorId(id);
  }

  async definirLiderEquipe(funcionarioId: string, equipeId: number) {
    await this.db
      .update(equipeFuncionarios)
      .set({ ehLider: true, atualizadoEm: new Date().toISOString() })
      .where(and(eq(equipeFuncionarios.funcionarioId, funcionarioId), eq(equipeFuncionarios.equipeId, equipeId)));

    return await this.buscarFuncionariosPorEquipe(equipeId);
  }

  async removerLiderEquipe(funcionarioId: string, equipeId: number) {
    await this.db
      .update(equipeFuncionarios)
      .set({ ehLider: false, atualizadoEm: new Date().toISOString() })
      .where(and(eq(equipeFuncionarios.funcionarioId, funcionarioId), eq(equipeFuncionarios.equipeId, equipeId)));

    return await this.buscarFuncionariosPorEquipe(equipeId);
  }

  async removerFuncionarioDaEquipe(funcionarioId: string, equipeId: number): Promise<void> {
    await this.db
      .delete(equipeFuncionarios)
      .where(and(eq(equipeFuncionarios.funcionarioId, funcionarioId), eq(equipeFuncionarios.equipeId, equipeId)));
  }

  async removerFuncionarioDeTodasEquipes(funcionarioId: string): Promise<void> {
    await this.db.delete(equipeFuncionarios).where(eq(equipeFuncionarios.funcionarioId, funcionarioId));
  }

  async removerTodosFuncionariosDaEquipe(equipeId: number): Promise<void> {
    await this.db.delete(equipeFuncionarios).where(eq(equipeFuncionarios.equipeId, equipeId));
  }
}
