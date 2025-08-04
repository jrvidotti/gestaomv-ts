import { InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, integer, sqliteTable, real, unique } from 'drizzle-orm/sqlite-core';
import { idAutoIncrement } from '../../helpers';
import { solicitacoesMaterialItens } from '.';
import { tiposMaterial } from './tipos_material';
import { unidadesMedida } from './unidades_medida';
import z from 'zod';

export const materiais = sqliteTable(
  'materiais',
  {
    id: idAutoIncrement(),
    tipoMaterialId: text('tipo_material_id')
      .notNull()
      .references(() => tiposMaterial.id),
    nome: text('nome').notNull(),
    unidadeMedidaId: text('unidade_medida_id')
      .notNull()
      .references(() => unidadesMedida.id),
    descricao: text('descricao'),
    valorUnitario: real('valor_unitario').notNull(),
    foto: text('foto'),
    ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
    criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
    atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [unique('materiais_unique').on(table.tipoMaterialId, table.nome, table.unidadeMedidaId)],
);

// ===== RELATIONS =====

export const materiaisRelations = relations(materiais, ({ many, one }) => ({
  solicitacaoItens: many(solicitacoesMaterialItens),
  tipoMaterial: one(tiposMaterial, {
    fields: [materiais.tipoMaterialId],
    references: [tiposMaterial.id],
  }),
  unidadeMedida: one(unidadesMedida, {
    fields: [materiais.unidadeMedidaId],
    references: [unidadesMedida.id],
  }),
}));

// ============ SCHEMAS DE MATERIAIS ============

export const criarMaterialSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().optional(),
  tipoMaterialId: z.string(),
  valorUnitario: z.number().min(0, 'Valor unitário deve ser maior ou igual a zero'),
  foto: z.string().optional().or(z.literal('')),
  unidadeMedidaId: z.string().min(1, 'Unidade de medida é obrigatória').default('UN'),
});

export const atualizarMaterialSchema = criarMaterialSchema.partial().extend({
  ativo: z.boolean().optional(),
});

export const filtroMateriaisSchema = z.object({
  busca: z.string().optional(),
  tipoMaterialId: z.string().optional(),
  ativo: z.boolean().optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

// Schema para formulário de criar material (com transformações)
export const formCriarMaterialSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .transform((val) => val.trim()),
  descricao: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  tipoMaterialId: z.string(),
  valorUnitario: z
    .string()
    .min(1, 'Valor é obrigatório')
    .transform((val) => {
      const num = parseFloat(val.replace(',', '.'));
      if (isNaN(num) || num < 0) {
        throw new Error('Valor deve ser um número válido maior ou igual a zero');
      }
      return num;
    }),
  foto: z.string().optional(),
  unidadeMedidaId: z
    .string()
    .min(1, 'Unidade de medida é obrigatória')
    .default('UN')
    .transform((val) => val.trim()),
});

// ============ TIPOS DERIVADOS ============

export type CriarMaterialData = z.infer<typeof criarMaterialSchema>;
export type AtualizarMaterialData = z.infer<typeof atualizarMaterialSchema>;
export type FiltrosMateriais = z.infer<typeof filtroMateriaisSchema>;

export type FormCriarMaterialData = z.infer<typeof formCriarMaterialSchema>;

export type Material = InferSelectModel<typeof materiais>;
