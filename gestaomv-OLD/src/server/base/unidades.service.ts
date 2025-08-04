import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { getDatabase } from '../database/database';
import { Unidade, unidades, type CreateUnidadeDto, type UpdateUnidadeDto } from '@/shared';

@Injectable()
export class UnidadesService {
  private get db() {
    return getDatabase();
  }

  async create(unidadeData: CreateUnidadeDto): Promise<Unidade> {
    const [unidade] = await this.db
      .insert(unidades)
      .values({
        ...unidadeData,
      })
      .returning();

    return unidade;
  }

  async findAll(): Promise<Unidade[]> {
    const allUnidades = await this.db.query.unidades.findMany({
      with: {
        empresa: true,
      },
      orderBy: (unidades, { asc }) => [asc(unidades.nome)],
    });

    return allUnidades;
  }

  async findOne(id: number): Promise<Unidade | undefined> {
    const unidade = await this.db.query.unidades.findFirst({
      where: eq(unidades.id, id),
      with: {
        empresa: true,
      },
    });

    if (!unidade) return undefined;

    return unidade;
  }

  async update(id: number, unidadeData: UpdateUnidadeDto): Promise<Unidade | undefined> {
    const updateData = {
      ...unidadeData,
      atualizadoEm: new Date().toISOString(),
    };

    await this.db.update(unidades).set(updateData).where(eq(unidades.id, id));

    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.db.delete(unidades).where(eq(unidades.id, id));
  }

  async findByCodigo(codigo: number): Promise<Unidade | undefined> {
    const unidade = await this.db.query.unidades.findFirst({
      where: eq(unidades.codigo, codigo),
      with: {
        empresa: true,
      },
    });

    if (!unidade) return undefined;

    return unidade;
  }

  async findByEmpresa(empresaId: number): Promise<Unidade[]> {
    const unidadesByEmpresa = await this.db.query.unidades.findMany({
      where: eq(unidades.empresaId, empresaId),
      with: {
        empresa: true,
      },
      orderBy: (unidades, { asc }) => [asc(unidades.nome)],
    });

    return unidadesByEmpresa;
  }

  async findByPontowebId(pontowebId: number): Promise<Unidade | undefined> {
    const unidade = await this.db.query.unidades.findFirst({
      where: eq(unidades.pontowebId, pontowebId),
      with: {
        empresa: true,
      },
    });

    if (!unidade) return undefined;

    return unidade;
  }
}
