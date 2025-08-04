import { unidades } from '@/shared';
import { ImportExportOptions } from '.';
import * as schema from '@/shared';
import { getDatabase } from '@/server/database/database';
import { eq } from 'drizzle-orm';

export interface UnidadeImport {
  nome: string;
  codigo: number;
  empresaCnpj: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  pontowebId: number | null;
}

export const config = {
  descricaoArquivo: 'Dados de unidades para seed',
  buscarItens: async () => {
    return await getDatabase()
      .select({
        nome: schema.unidades.nome,
        codigo: schema.unidades.codigo,
        empresaCnpj: schema.empresas.cnpj,
        endereco: schema.unidades.endereco,
        cidade: schema.unidades.cidade,
        estado: schema.unidades.estado,
        telefone: schema.unidades.telefone,
        pontowebId: schema.unidades.pontowebId,
      })
      .from(schema.unidades)
      .leftJoin(schema.empresas, eq(schema.unidades.empresaId, schema.empresas.id))
      .orderBy(schema.unidades.codigo);
  },
  importarItem: async (unidade) => {
    // Buscar empresa pelo CNPJ se fornecido
    let empresaId: number | null = null;
    if (unidade.empresaCnpj) {
      const empresa = await getDatabase()
        .select({ id: schema.empresas.id })
        .from(schema.empresas)
        .where(eq(schema.empresas.cnpj, unidade.empresaCnpj))
        .limit(1);

      if (empresa.length === 0) {
        throw new Error(`Empresa com CNPJ ${unidade.empresaCnpj} não encontrada para a unidade ${unidade.codigo}`);
      }
      empresaId = empresa[0].id;
    }

    const result = await getDatabase()
      .insert(unidades)
      .values({
        nome: unidade.nome,
        codigo: unidade.codigo,
        empresaId: empresaId,
        endereco: unidade.endereco,
        cidade: unidade.cidade,
        estado: unidade.estado,
        telefone: unidade.telefone,
        pontowebId: unidade.pontowebId,
      })
      .onConflictDoNothing();

    return result.changes > 0;
  },
} satisfies ImportExportOptions<UnidadeImport>;
