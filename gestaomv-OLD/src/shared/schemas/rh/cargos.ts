import { InferSelectModel, relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { idAutoIncrement } from '../../helpers';
import { Departamento, departamentos } from './departamentos';
import { Funcionario, funcionarios } from './funcionarios';
import z from 'zod';

export const cargos = sqliteTable(
  'cargos',
  {
    id: idAutoIncrement(),
    nome: text('nome').notNull().unique(),
    descricao: text('descricao'),
    departamentoId: integer('departamento_id')
      .notNull()
      .references(() => departamentos.id),
    pontowebId: integer('pontoweb_id').unique(),
    criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
    atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [index('cargos_departamento_id_idx').on(table.departamentoId)],
);

// Relacionamentos

export const cargosRelations = relations(cargos, ({ one, many }) => ({
  departamento: one(departamentos, {
    fields: [cargos.departamentoId],
    references: [departamentos.id],
  }),
  funcionarios: many(funcionarios),
}));

// ============ SCHEMAS DE CARGOS ============

export const criarCargoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  departamentoId: z.number().min(1, 'Departamento é obrigatório'),
  pontowebId: z.number().min(1).optional(),
});

export const atualizarCargoSchema = criarCargoSchema.partial();

export const filtrosCargosSchema = z.object({
  busca: z.string().optional(),
  departamentoId: z.number().min(1).optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

// ============ TIPOS DERIVADOS ============

// Cargos
export type CriarCargoData = z.infer<typeof criarCargoSchema>;
export type AtualizarCargoData = z.infer<typeof atualizarCargoSchema>;
export type FiltrosCargos = z.infer<typeof filtrosCargosSchema>;

// ============ INTERFACES COMPLEMENTARES ============

export type Cargo = InferSelectModel<typeof cargos> & {
  departamento?: Departamento;
  funcionarios?: Funcionario[];
};
