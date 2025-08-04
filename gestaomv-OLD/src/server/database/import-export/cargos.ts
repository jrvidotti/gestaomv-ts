import { cargos } from '@/shared';
import { eq } from 'drizzle-orm';
import { ImportExportOptions } from '.';
import * as schema from '@/shared';
import { getDatabase } from '@/server/database/database';

export interface CargoImport {
  nome: string;
  descricao: string | null;
  departamentoNome: string;
  pontowebId: number | null;
}

export const config = {
  descricaoArquivo: 'Dados de cargos para seed',
  buscarItens: async () => {
    return await getDatabase()
      .select({
        nome: schema.cargos.nome,
        descricao: schema.cargos.descricao,
        departamentoNome: schema.departamentos.nome,
        pontowebId: schema.cargos.pontowebId,
      })
      .from(schema.cargos)
      .innerJoin(schema.departamentos, eq(schema.cargos.departamentoId, schema.departamentos.id))
      .orderBy(schema.cargos.nome);
  },
  importarItem: async (cargo) => {
    // Verificar se o departamento existe
    const departamento = await getDatabase()
      .select({ id: schema.departamentos.id })
      .from(schema.departamentos)
      .where(eq(schema.departamentos.nome, cargo.departamentoNome))
      .limit(1);

    if (departamento.length === 0) {
      throw new Error(`Departamento '${cargo.departamentoNome}' não encontrado para o cargo ${cargo.nome}`);
    }

    const result = await getDatabase()
      .insert(cargos)
      .values({
        nome: cargo.nome,
        descricao: cargo.descricao,
        departamentoId: departamento[0].id,
        pontowebId: cargo.pontowebId,
      })
      .onConflictDoNothing();

    return result.changes > 0;
  },
} satisfies ImportExportOptions<CargoImport>;
