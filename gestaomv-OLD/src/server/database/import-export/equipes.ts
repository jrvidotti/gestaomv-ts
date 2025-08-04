import { equipes } from '@/shared';
import { ImportExportOptions } from '.';
import * as schema from '@/shared';
import { getDatabase } from '@/server/database/database';

export interface EquipeImport {
  nome: string;
  codigo: string;
}

export const config = {
  descricaoArquivo: 'Dados de equipes para seed',
  buscarItens: async () => {
    return await getDatabase()
      .select({
        nome: schema.equipes.nome,
        codigo: schema.equipes.codigo,
      })
      .from(schema.equipes)
      .orderBy(schema.equipes.codigo);
  },
  importarItem: async (equipe) => {
    const result = await getDatabase()
      .insert(equipes)
      .values({
        nome: equipe.nome,
        codigo: equipe.codigo,
      })
      .onConflictDoNothing();

    return result.changes > 0;
  },
} satisfies ImportExportOptions<EquipeImport>;
