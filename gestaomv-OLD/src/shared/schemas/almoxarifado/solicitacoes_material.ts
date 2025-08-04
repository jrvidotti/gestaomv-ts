import { relations, sql } from 'drizzle-orm';
import { text, integer, sqliteTable, index } from 'drizzle-orm/sqlite-core';
import { idAutoIncrement } from '../../helpers';
import { users, unidades } from '../base';
import { materiais } from '.';
import z from 'zod';

export const STATUS_SOLICITACAO = {
  PENDENTE: 'PENDENTE',
  APROVADA: 'APROVADA',
  REJEITADA: 'REJEITADA',
  CANCELADA: 'CANCELADA',
  ATENDIDA: 'ATENDIDA',
} as const;

export type StatusSolicitacaoType = (typeof STATUS_SOLICITACAO)[keyof typeof STATUS_SOLICITACAO];
export const STATUS_SOLICITACAO_ARRAY = Object.values(STATUS_SOLICITACAO) as [string, ...string[]];

export interface StatusSolicitacaoData {
  value: StatusSolicitacaoType;
  label: string;
  description: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
}

export const STATUS_SOLICITACAO_DATA: Record<StatusSolicitacaoType, StatusSolicitacaoData> = {
  [STATUS_SOLICITACAO.PENDENTE]: {
    value: STATUS_SOLICITACAO.PENDENTE,
    label: 'Pendente',
    description: 'Aguardando aprovação',
    variant: 'default',
    color: 'blue',
  },
  [STATUS_SOLICITACAO.APROVADA]: {
    value: STATUS_SOLICITACAO.APROVADA,
    label: 'Aprovada',
    description: 'Aguardando aprovação',
    variant: 'default',
    color: 'blue',
  },
  [STATUS_SOLICITACAO.REJEITADA]: {
    value: STATUS_SOLICITACAO.REJEITADA,
    label: 'Rejeitada',
    description: 'Aguardando aprovação',
    variant: 'default',
    color: 'blue',
  },
  [STATUS_SOLICITACAO.CANCELADA]: {
    value: STATUS_SOLICITACAO.CANCELADA,
    label: 'Cancelada',
    description: 'Aguardando aprovação',
    variant: 'default',
    color: 'blue',
  },
  [STATUS_SOLICITACAO.ATENDIDA]: {
    value: STATUS_SOLICITACAO.ATENDIDA,
    label: 'Atendida',
    description: 'Aguardando aprovação',
    variant: 'default',
    color: 'blue',
  },
};

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  ...Object.values(STATUS_SOLICITACAO_DATA).map((status) => ({
    value: status.value,
    label: status.label,
  })),
];

export const solicitacoesMaterial = sqliteTable(
  'solicitacoes_material',
  {
    id: idAutoIncrement(),
    solicitanteId: integer('solicitante_id')
      .notNull()
      .references(() => users.id),
    unidadeId: integer('unidade_id').references(() => unidades.id),
    aprovadorId: integer('aprovador_id').references(() => users.id),
    atendidoPorId: integer('atendido_por_id').references(() => users.id),
    dataOperacao: text('data_operacao')
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    dataAprovacao: text('data_aprovacao'),
    dataAtendimento: text('data_atendimento'),
    status: text('status', { enum: STATUS_SOLICITACAO_ARRAY })
      .notNull()
      .$type<StatusSolicitacaoType>()
      .default(STATUS_SOLICITACAO.PENDENTE),
    observacoes: text('observacoes'),
    criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
    atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index('solicitacoes_material_solicitante_id_idx').on(table.solicitanteId),
    index('solicitacoes_material_unidade_id_idx').on(table.unidadeId),
    index('solicitacoes_material_aprovador_id_idx').on(table.aprovadorId),
    index('solicitacoes_material_atendido_por_id_idx').on(table.atendidoPorId),
  ],
);

export const solicitacoesMaterialItens = sqliteTable(
  'solicitacoes_material_itens',
  {
    id: idAutoIncrement(),
    solicitacaoMaterialId: integer('solicitacao_material_id')
      .notNull()
      .references(() => solicitacoesMaterial.id, { onDelete: 'cascade' }),
    materialId: integer('material_id')
      .notNull()
      .references(() => materiais.id),
    qtdSolicitada: integer('qtd_solicitada').notNull(),
    qtdAtendida: integer('qtd_atendida'),
    criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
    atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index('solicitacoes_material_itens_solicitacao_material_id_idx').on(table.solicitacaoMaterialId),
    index('solicitacoes_material_itens_material_id_idx').on(table.materialId),
  ],
);

// ===== RELATIONS =====

export const solicitacoesMaterialRelations = relations(solicitacoesMaterial, ({ one, many }) => ({
  solicitante: one(users, {
    fields: [solicitacoesMaterial.solicitanteId],
    references: [users.id],
  }),
  unidade: one(unidades, {
    fields: [solicitacoesMaterial.unidadeId],
    references: [unidades.id],
  }),
  aprovador: one(users, {
    fields: [solicitacoesMaterial.aprovadorId],
    references: [users.id],
    relationName: 'SolicitacaoAprovador',
  }),
  atendidoPor: one(users, {
    fields: [solicitacoesMaterial.atendidoPorId],
    references: [users.id],
    relationName: 'SolicitacaoAtendente',
  }),
  itens: many(solicitacoesMaterialItens),
}));

export const solicitacoesMaterialItensRelations = relations(solicitacoesMaterialItens, ({ one }) => ({
  solicitacaoMaterial: one(solicitacoesMaterial, {
    fields: [solicitacoesMaterialItens.solicitacaoMaterialId],
    references: [solicitacoesMaterial.id],
  }),
  material: one(materiais, {
    fields: [solicitacoesMaterialItens.materialId],
    references: [materiais.id],
  }),
}));

// ============ SCHEMAS DE SOLICITAÇÕES ============

export const itemSolicitacaoSchema = z.object({
  materialId: z.number().min(1, 'Material é obrigatório'),
  qtdSolicitada: z.number().min(1, 'Quantidade deve ser maior que zero'),
});

export const criarSolicitacaoMaterialSchema = z.object({
  unidadeId: z.number().min(1, 'Unidade é obrigatória'),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
  itens: z
    .array(itemSolicitacaoSchema)
    .min(1, 'Deve haver pelo menos um item na solicitação')
    .max(50, 'Máximo de 50 itens por solicitação'),
});

export const itemAtualizarSolicitacaoSchema = z.object({
  id: z.number().min(1, 'ID do item é obrigatório'),
  qtdAtendida: z.number().min(0, 'Quantidade deve ser maior ou igual a zero').optional(),
});

export const atualizarSolicitacaoSchema = z.object({
  status: z.enum([STATUS_SOLICITACAO.APROVADA, STATUS_SOLICITACAO.REJEITADA]),
  motivoRejeicao: z.string().max(500, 'Motivo da rejeição deve ter no máximo 500 caracteres').optional(),
  itens: z.array(itemAtualizarSolicitacaoSchema).optional(),
});

export const itemAtenderSolicitacaoSchema = z.object({
  id: z.number().min(1, 'ID do item é obrigatório'),
  qtdAtendida: z.number().min(0, 'Quantidade atendida deve ser maior ou igual a zero'),
});

export const atenderSolicitacaoSchema = z.object({
  itens: z.array(itemAtenderSolicitacaoSchema).min(1, 'Deve haver pelo menos um item para atender'),
});

export const filtroSolicitacoesSchema = z.object({
  status: z.enum(STATUS_SOLICITACAO_ARRAY).optional(),
  unidadeId: z.number().min(1).optional(),
  solicitanteId: z.number().min(1).optional(),
  dataInicial: z.date().optional(),
  dataFinal: z.date().optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

// Schema para formulário de nova solicitação
export const formNovaSolicitacaoSchema = z.object({
  unidadeId: z
    .string()
    .min(1, 'Unidade é obrigatória')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) {
        throw new Error('Unidade deve ser selecionada');
      }
      return num;
    }),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
  itens: z
    .array(
      z.object({
        materialId: z
          .string()
          .min(1, 'Material é obrigatório')
          .transform((val) => {
            const num = parseInt(val, 10);
            if (isNaN(num) || num < 1) {
              throw new Error('Material deve ser selecionado');
            }
            return num;
          }),
        qtdSolicitada: z
          .string()
          .min(1, 'Quantidade é obrigatória')
          .transform((val) => {
            const num = parseInt(val, 10);
            if (isNaN(num) || num < 1) {
              throw new Error('Quantidade deve ser maior que zero');
            }
            return num;
          }),
      }),
    )
    .min(1, 'Deve haver pelo menos um item na solicitação')
    .max(50, 'Máximo de 50 itens por solicitação'),
});

// ============ TIPOS DERIVADOS ============

export type CriarSolicitacaoMaterialData = z.infer<typeof criarSolicitacaoMaterialSchema>;
export type AtualizarSolicitacaoData = z.infer<typeof atualizarSolicitacaoSchema>;
export type AtenderSolicitacaoData = z.infer<typeof atenderSolicitacaoSchema>;
export type FiltrosSolicitacoes = z.infer<typeof filtroSolicitacoesSchema>;

export type FormNovaSolicitacaoData = z.infer<typeof formNovaSolicitacaoSchema>;
