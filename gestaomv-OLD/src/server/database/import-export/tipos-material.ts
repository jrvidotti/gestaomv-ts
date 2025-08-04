import { tiposMaterial } from '@/shared';
import { ImportExportOptions } from '.';
import * as schema from '@/shared';
import { getDatabase } from '@/server/database/database';

export interface TipoMaterialImport {
  id: string;
  nome: string;
}

export const config = {
  descricaoArquivo: 'Dados de tipos de material para seed',
  buscarItens: async () => {
    return await getDatabase()
      .select({
        id: schema.tiposMaterial.id,
        nome: schema.tiposMaterial.nome,
      })
      .from(schema.tiposMaterial)
      .orderBy(schema.tiposMaterial.nome);
  },
  importarItem: async (tipoMaterial) => {
    const result = await getDatabase()
      .insert(tiposMaterial)
      .values({
        id: tipoMaterial.id,
        nome: tipoMaterial.nome,
      })
      .onConflictDoNothing();

    return result.changes > 0;
  },
} satisfies ImportExportOptions<TipoMaterialImport>;
