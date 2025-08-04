import { InferSelectModel, relations } from 'drizzle-orm';
import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { materiais } from '.';

// tabela de unidades de medida - uso interno
export const unidadesMedida = sqliteTable('unidades_medida', {
  id: text('id').notNull().primaryKey(),
  nome: text('nome').notNull().unique(),
});

export const unidadesMedidaRelations = relations(unidadesMedida, ({ many }) => ({
  materiais: many(materiais),
}));

export type UnidadeMedida = InferSelectModel<typeof unidadesMedida>;
