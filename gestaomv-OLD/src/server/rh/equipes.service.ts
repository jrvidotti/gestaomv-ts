import { Injectable } from '@nestjs/common';
import { eq, and, asc, sql, count } from 'drizzle-orm';
import { getDatabase } from '../database/database';
import { equipes, CriarEquipeData, AtualizarEquipeData, FiltrosEquipes } from '@/shared';

@Injectable()
export class EquipesService {
  private get db() {
    return getDatabase();
  }

  async criarEquipe(equipeData: CriarEquipeData) {
    const [equipe] = await this.db
      .insert(equipes)
      .values({
        ...equipeData,
      })
      .returning();

    return equipe;
  }

  async listarEquipes(filtros?: FiltrosEquipes) {
    const { busca, pagina = 1, limite = 20 } = filtros || {};
    const offset = (pagina - 1) * limite;

    const condicoes = [];

    if (busca) {
      condicoes.push(sql`${equipes.nome} LIKE ${'%' + busca + '%'} OR ${equipes.codigo} LIKE ${'%' + busca + '%'}`);
    }

    const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

    const equipesList = await this.db
      .select()
      .from(equipes)
      .where(whereClause)
      .orderBy(asc(equipes.nome))
      .limit(limite)
      .offset(offset);

    const [{ total }] = await this.db.select({ total: count() }).from(equipes).where(whereClause);

    return {
      equipes: equipesList,
      total: Number(total),
    };
  }

  async buscarEquipePorId(id: number) {
    const equipe = await this.db.query.equipes.findFirst({
      where: eq(equipes.id, id),
    });

    return equipe;
  }

  async buscarEquipePorCodigo(codigo: string) {
    const equipe = await this.db.query.equipes.findFirst({
      where: eq(equipes.codigo, codigo),
    });

    return equipe;
  }

  async atualizarEquipe(id: number, equipeData: AtualizarEquipeData) {
    const dadosAtualizacao = {
      ...equipeData,
      atualizadoEm: new Date().toISOString(),
    };

    await this.db.update(equipes).set(dadosAtualizacao).where(eq(equipes.id, id));

    return await this.buscarEquipePorId(id);
  }

  async deletarEquipe(id: number): Promise<void> {
    await this.db.delete(equipes).where(eq(equipes.id, id));
  }
}
