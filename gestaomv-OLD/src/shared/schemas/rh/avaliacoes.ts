import { InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, integer, sqliteTable, index, real } from 'drizzle-orm/sqlite-core';
import { idAutoIncrement } from '../../helpers';
import { User, users } from '../base';
import { Funcionario, funcionarios } from './funcionarios';
import z from 'zod';

// Avaliações
export const tipoAvaliacaoExperienciaEnum = ['AVALIACAO_45_DIAS', 'AVALIACAO_90_DIAS'] as const;

export const recomendacaoAvaliacaoEnum = ['EFETIVACAO', 'PRORROGACAO', 'DESLIGAMENTO'] as const;

export const avaliacoesExperiencia = sqliteTable(
  'avaliacoes_experiencia',
  {
    id: idAutoIncrement(),
    funcionarioId: integer('funcionario_id')
      .notNull()
      .references(() => funcionarios.id),
    avaliadorId: integer('avaliador_id')
      .notNull()
      .references(() => users.id),
    // Período avaliado
    tipo: text('tipo', { enum: tipoAvaliacaoExperienciaEnum }).notNull(),
    dataAvaliacao: text('data_avaliacao').notNull(),
    // Critérios de avaliação (escala de 1-5)
    pontualidade: integer('pontualidade').notNull(),
    comprometimento: integer('comprometimento').notNull(),
    trabalhoEquipe: integer('trabalho_equipe').notNull(),
    iniciativa: integer('iniciativa').notNull(),
    comunicacao: integer('comunicacao').notNull(),
    conhecimentoTecnico: integer('conhecimento_tecnico').notNull(),
    // Média e recomendação
    mediaFinal: real('media_final').notNull(),
    recomendacao: text('recomendacao', {
      enum: recomendacaoAvaliacaoEnum,
    }).notNull(),
    // Observações
    pontosFortes: text('pontos_fortes'),
    pontosMelhoria: text('pontos_melhoria'),
    observacoes: text('observacoes'),
    criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
    atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index('avaliacoes_experiencia_funcionario_id_idx').on(table.funcionarioId),
    index('avaliacoes_experiencia_avaliador_id_idx').on(table.avaliadorId),
  ],
);

export const classificacaoAvaliacaoPeriodicaEnum = ['EXCELENTE', 'BOM', 'SATISFATORIO', 'INSATISFATORIO'] as const;

export const avaliacoesPeriodicas = sqliteTable(
  'avaliacoes_periodicas',
  {
    id: idAutoIncrement(),
    funcionarioId: integer('funcionario_id')
      .notNull()
      .references(() => funcionarios.id),
    avaliadorId: integer('avaliador_id')
      .notNull()
      .references(() => users.id),
    // Período avaliado
    periodoInicial: text('periodo_inicial').notNull(),
    periodoFinal: text('periodo_final').notNull(),
    dataAvaliacao: text('data_avaliacao').notNull(),
    // Critérios de avaliação (escala de 1-5)
    desempenho: integer('desempenho').notNull(),
    comprometimento: integer('comprometimento').notNull(),
    trabalhoEquipe: integer('trabalho_equipe').notNull(),
    lideranca: integer('lideranca').notNull(),
    comunicacao: integer('comunicacao').notNull(),
    inovacao: integer('inovacao').notNull(),
    resolucaoProblemas: integer('resolucao_problemas').notNull(),
    qualidadeTrabalho: integer('qualidade_trabalho').notNull(),
    // Média e classificação
    mediaFinal: real('media_final').notNull(),
    classificacao: text('classificacao', {
      enum: classificacaoAvaliacaoPeriodicaEnum,
    }).notNull(),
    // Metas e observações
    metasAnterior: text('metas_anterior'),
    avaliacaoMetas: text('avaliacao_metas'),
    novasMetas: text('novas_metas'),
    feedbackGeral: text('feedback_geral'),
    planoDesenvolvimento: text('plano_desenvolvimento'),
    criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
    atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index('avaliacoes_periodicas_funcionario_id_idx').on(table.funcionarioId),
    index('avaliacoes_periodicas_avaliador_id_idx').on(table.avaliadorId),
  ],
);

// Relacionamentos

export const avaliacoesExperienciaRelations = relations(avaliacoesExperiencia, ({ one }) => ({
  funcionario: one(funcionarios, {
    fields: [avaliacoesExperiencia.funcionarioId],
    references: [funcionarios.id],
  }),
  avaliador: one(users, {
    fields: [avaliacoesExperiencia.avaliadorId],
    references: [users.id],
  }),
}));

export const avaliacoesPeriodicasRelations = relations(avaliacoesPeriodicas, ({ one }) => ({
  funcionario: one(funcionarios, {
    fields: [avaliacoesPeriodicas.funcionarioId],
    references: [funcionarios.id],
  }),
  avaliador: one(users, {
    fields: [avaliacoesPeriodicas.avaliadorId],
    references: [users.id],
  }),
}));

// ============ SCHEMAS DE AVALIAÇÕES DE EXPERIÊNCIA ============

export const criarAvaliacaoExperienciaSchema = z.object({
  funcionarioId: z.number().min(1, 'Funcionário é obrigatório'),
  tipo: z.enum(tipoAvaliacaoExperienciaEnum),
  dataAvaliacao: z.string().min(1, 'Data da avaliação é obrigatória'),
  pontualidade: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  comprometimento: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  trabalhoEquipe: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  iniciativa: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  comunicacao: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  conhecimentoTecnico: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  recomendacao: z.enum(recomendacaoAvaliacaoEnum),
  pontosFortes: z.string().max(1000, 'Pontos fortes devem ter no máximo 1000 caracteres').optional(),
  pontosMelhoria: z.string().max(1000, 'Pontos de melhoria devem ter no máximo 1000 caracteres').optional(),
  observacoes: z.string().max(1000, 'Observações devem ter no máximo 1000 caracteres').optional(),
});

export const atualizarAvaliacaoExperienciaSchema = criarAvaliacaoExperienciaSchema.partial().extend({
  mediaFinal: z.number().min(1).max(5).optional(),
});

export const filtrosAvaliacoesExperienciaSchema = z.object({
  funcionarioId: z.number().min(1).optional(),
  avaliadorId: z.number().min(1).optional(),
  tipo: z.enum(tipoAvaliacaoExperienciaEnum).optional(),
  recomendacao: z.enum(recomendacaoAvaliacaoEnum).optional(),
  dataInicial: z.string().optional(),
  dataFinal: z.string().optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

// ============ SCHEMAS DE AVALIAÇÕES PERIÓDICAS ============

export const criarAvaliacaoPeriodicaSchema = z.object({
  funcionarioId: z.number().min(1, 'Funcionário é obrigatório'),
  periodoInicial: z.string().min(1, 'Período inicial é obrigatório'),
  periodoFinal: z.string().min(1, 'Período final é obrigatório'),
  dataAvaliacao: z.string().min(1, 'Data da avaliação é obrigatória'),
  desempenho: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  comprometimento: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  trabalhoEquipe: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  lideranca: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  comunicacao: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  inovacao: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  resolucaoProblemas: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  qualidadeTrabalho: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  metasAnterior: z.string().max(2000, 'Metas anteriores devem ter no máximo 2000 caracteres').optional(),
  avaliacaoMetas: z.string().max(2000, 'Avaliação de metas deve ter no máximo 2000 caracteres').optional(),
  novasMetas: z.string().max(2000, 'Novas metas devem ter no máximo 2000 caracteres').optional(),
  feedbackGeral: z.string().max(2000, 'Feedback geral deve ter no máximo 2000 caracteres').optional(),
  planoDesenvolvimento: z.string().max(2000, 'Plano de desenvolvimento deve ter no máximo 2000 caracteres').optional(),
});

export const atualizarAvaliacaoPeriodicaSchema = criarAvaliacaoPeriodicaSchema.partial().extend({
  mediaFinal: z.number().min(1).max(5).optional(),
  classificacao: z.enum(classificacaoAvaliacaoPeriodicaEnum).optional(),
});

export const filtrosAvaliacoesPeriodicasSchema = z.object({
  funcionarioId: z.number().min(1).optional(),
  avaliadorId: z.number().min(1).optional(),
  classificacao: z.enum(classificacaoAvaliacaoPeriodicaEnum).optional(),
  periodoInicial: z.string().optional(),
  periodoFinal: z.string().optional(),
  dataInicial: z.string().optional(),
  dataFinal: z.string().optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

// ============ SCHEMAS PARA FORMULÁRIOS DO FRONTEND ============

// Schema para formulário de avaliação de experiência
export const formCriarAvaliacaoExperienciaSchema = z.object({
  funcionarioId: z
    .string()
    .min(1, 'Funcionário é obrigatório')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) {
        throw new Error('Funcionário deve ser selecionado');
      }
      return num;
    }),
  tipo: z.enum(tipoAvaliacaoExperienciaEnum),
  dataAvaliacao: z.string().min(1, 'Data da avaliação é obrigatória'),
  pontualidade: z
    .string()
    .min(1, 'Nota é obrigatória')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        throw new Error('Nota deve ser entre 1 e 5');
      }
      return num;
    }),
  comprometimento: z
    .string()
    .min(1, 'Nota é obrigatória')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        throw new Error('Nota deve ser entre 1 e 5');
      }
      return num;
    }),
  trabalhoEquipe: z
    .string()
    .min(1, 'Nota é obrigatória')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        throw new Error('Nota deve ser entre 1 e 5');
      }
      return num;
    }),
  iniciativa: z
    .string()
    .min(1, 'Nota é obrigatória')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        throw new Error('Nota deve ser entre 1 e 5');
      }
      return num;
    }),
  comunicacao: z
    .string()
    .min(1, 'Nota é obrigatória')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        throw new Error('Nota deve ser entre 1 e 5');
      }
      return num;
    }),
  conhecimentoTecnico: z
    .string()
    .min(1, 'Nota é obrigatória')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        throw new Error('Nota deve ser entre 1 e 5');
      }
      return num;
    }),
  recomendacao: z.enum(recomendacaoAvaliacaoEnum),
  pontosFortes: z
    .string()
    .max(1000, 'Pontos fortes devem ter no máximo 1000 caracteres')
    .transform((val) => val.trim())
    .optional(),
  pontosMelhoria: z
    .string()
    .max(1000, 'Pontos de melhoria devem ter no máximo 1000 caracteres')
    .transform((val) => val.trim())
    .optional(),
  observacoes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .transform((val) => val.trim())
    .optional(),
});

// ============ TIPOS DERIVADOS ============

// Avaliações
export type CriarAvaliacaoExperienciaData = z.infer<typeof criarAvaliacaoExperienciaSchema>;
export type AtualizarAvaliacaoExperienciaData = z.infer<typeof atualizarAvaliacaoExperienciaSchema>;
export type FiltrosAvaliacoesExperiencia = z.infer<typeof filtrosAvaliacoesExperienciaSchema>;

export type CriarAvaliacaoPeriodicaData = z.infer<typeof criarAvaliacaoPeriodicaSchema>;
export type AtualizarAvaliacaoPeriodicaData = z.infer<typeof atualizarAvaliacaoPeriodicaSchema>;
export type FiltrosAvaliacoesPeriodicas = z.infer<typeof filtrosAvaliacoesPeriodicasSchema>;

// Formulários
export type FormCriarAvaliacaoExperienciaData = z.infer<typeof formCriarAvaliacaoExperienciaSchema>;

// ============ TYPE ALIASES PARA ENUMS ============

export type TipoAvaliacaoExperienciaType = (typeof tipoAvaliacaoExperienciaEnum)[number];
export type RecomendacaoAvaliacaoType = (typeof recomendacaoAvaliacaoEnum)[number];
export type ClassificacaoAvaliacaoPeriodicaType = (typeof classificacaoAvaliacaoPeriodicaEnum)[number];

// ============ INTERFACES COMPLEMENTARES ============

export type AvaliacaoExperiencia = InferSelectModel<typeof avaliacoesExperiencia> & {
  funcionario?: Funcionario;
  avaliador?: User;
};

export type AvaliacaoPeriodica = InferSelectModel<typeof avaliacoesPeriodicas> & {
  funcionario?: Funcionario;
  avaliador?: User;
};
