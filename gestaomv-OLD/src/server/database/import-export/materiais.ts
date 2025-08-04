import { materiais } from '@/shared';
import { ImportExportOptions } from '.';
import * as schema from '@/shared';
import { getDatabase } from '@/server/database/database';

export interface MaterialImport {
  nome: string;
  descricao: string | null;
  tipoMaterialId: string;
  valorUnitario: number;
  foto: string | null;
  ativo: boolean;
  unidadeMedidaId: string;
}

export const config = {
  descricaoArquivo: 'Dados de materiais para seed',
  buscarItens: async () => {
    return await getDatabase()
      .select({
        tipoMaterialId: schema.materiais.tipoMaterialId,
        nome: schema.materiais.nome,
        unidadeMedidaId: schema.materiais.unidadeMedidaId,
        descricao: schema.materiais.descricao,
        valorUnitario: schema.materiais.valorUnitario,
        foto: schema.materiais.foto,
        ativo: schema.materiais.ativo,
      })
      .from(schema.materiais)
      .orderBy(schema.materiais.nome);
  },
  importarItem: async (material) => {
    const result = await getDatabase()
      .insert(materiais)
      .values({
        tipoMaterialId: material.tipoMaterialId,
        nome: material.nome,
        unidadeMedidaId: material.unidadeMedidaId,
        descricao: material.descricao,
        valorUnitario: material.valorUnitario,
        foto: material.foto,
        ativo: material.ativo,
      })
      .onConflictDoNothing();

    return result.changes > 0;
  },
} satisfies ImportExportOptions<MaterialImport>;
