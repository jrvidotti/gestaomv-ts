import { InferSelectModel, relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { idAutoIncrement } from '../../helpers';
import { Unidade, unidades } from './unidades';
import { Funcionario } from '../rh';

export const empresas = sqliteTable('empresas', {
  id: idAutoIncrement(),
  razaoSocial: text('razao_social').notNull(),
  nomeFantasia: text('nome_fantasia'),
  cnpj: text('cnpj').notNull().unique(),
  pontowebId: integer('pontoweb_id').unique(),
  // unidadePadraoId: integer('unidade_padrao_id').references((): AnySQLiteColumn => unidades.id),
  criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
  atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
});

export const empresasRelations = relations(empresas, ({ many, one }) => ({
  unidades: many(unidades),
  // unidadePadrao: one(unidades, {
  //   fields: [empresas.unidadePadraoId],
  //   references: [unidades.id],
  // }),
}));

export type Empresa = InferSelectModel<typeof empresas> & {
  unidades?: Unidade[];
  funcionarios?: Funcionario[];
};
