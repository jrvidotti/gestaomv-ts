import { departamentos } from '@/shared';
import { ImportExportOptions } from '.';
import * as schema from '@/shared';
import { getDatabase } from '@/server/database/database';

export interface DepartamentoImport {
  nome: string;
  descricao: string | null;
  pontowebId: number | null;
}

export const config = {
  descricaoArquivo: 'Dados de departamentos para seed',
  buscarItens: async () => {
    return await getDatabase()
      .select({
        nome: schema.departamentos.nome,
        descricao: schema.departamentos.descricao,
        pontowebId: schema.departamentos.pontowebId,
      })
      .from(schema.departamentos)
      .orderBy(schema.departamentos.nome);
  },
  importarItem: async (departamento) => {
    const result = await getDatabase()
      .insert(departamentos)
      .values({
        nome: departamento.nome,
        descricao: departamento.descricao,
        pontowebId: departamento.pontowebId,
      })
      .onConflictDoNothing();

    return result.changes > 0;
  },
} satisfies ImportExportOptions<DepartamentoImport>;
