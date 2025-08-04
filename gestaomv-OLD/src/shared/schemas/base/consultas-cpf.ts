import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { idAutoIncrement } from '../../helpers';

export const consultasCpf = sqliteTable('consultas_cpf', {
  id: idAutoIncrement(),
  cpf: text('cpf').notNull().unique(),
  dados: text('dados').notNull().default('{}'),
  criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
});
