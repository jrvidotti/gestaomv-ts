import { InferSelectModel, relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { idAutoIncrement } from '../../helpers';
import { Empresa, empresas } from './empresas';
import { Funcionario, funcionarios } from '../rh';

export const unidades = sqliteTable('unidades', {
  id: idAutoIncrement(),
  nome: text('nome').notNull(),
  codigo: integer('codigo').notNull().unique(),
  empresaId: integer('empresa_id').references(() => empresas.id),
  endereco: text('endereco'),
  cidade: text('cidade'),
  estado: text('estado'),
  telefone: text('telefone'),
  pontowebId: integer('pontoweb_id').unique(),
  criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
  atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
});

export const unidadesRelations = relations(unidades, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [unidades.empresaId],
    references: [empresas.id],
  }),
  funcionarios: many(funcionarios),
}));

export type Unidade = InferSelectModel<typeof unidades> & {
  empresa?: Empresa | null;
  funcionarios?: Funcionario[];
};
