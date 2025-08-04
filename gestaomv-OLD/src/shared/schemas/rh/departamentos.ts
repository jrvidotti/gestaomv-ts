import { InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { idAutoIncrement } from '../../helpers';
import { Cargo, cargos } from './cargos';
import { Funcionario, funcionarios } from './funcionarios';
import z from 'zod';

export const departamentos = sqliteTable('departamentos', {
  id: idAutoIncrement(),
  nome: text('nome').notNull().unique(),
  descricao: text('descricao'),
  pontowebId: integer('pontoweb_id').unique(),
  criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
  atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
});

// Relacionamentos

export const departamentosRelations = relations(departamentos, ({ many }) => ({
  cargos: many(cargos),
  funcionarios: many(funcionarios),
}));

// ============ SCHEMAS DE DEPARTAMENTOS ============

export const criarDepartamentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  pontowebId: z.number().min(1).optional(),
});

export const atualizarDepartamentoSchema = criarDepartamentoSchema.partial();

export const filtrosDepartamentosSchema = z.object({
  busca: z.string().optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

// ============ TIPOS DERIVADOS ============

// Departamentos
export type CriarDepartamentoData = z.infer<typeof criarDepartamentoSchema>;
export type AtualizarDepartamentoData = z.infer<typeof atualizarDepartamentoSchema>;
export type FiltrosDepartamentos = z.infer<typeof filtrosDepartamentosSchema>;

// ============ INTERFACES COMPLEMENTARES ============

export type Departamento = InferSelectModel<typeof departamentos> & {
  cargos?: Cargo[];
  funcionarios?: Funcionario[];
};
