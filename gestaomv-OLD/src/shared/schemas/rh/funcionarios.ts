import { InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, integer, sqliteTable, unique, index, real } from 'drizzle-orm/sqlite-core';
import { idAutoIncrement } from '../../helpers';
import { Empresa, empresas, Unidade, unidades, users } from '../base';
import { Cargo, cargos } from './cargos';
import { Departamento, departamentos } from './departamentos';
import { Equipe, equipes } from './equipes';
import { avaliacoesExperiencia, avaliacoesPeriodicas } from './avaliacoes';
import z from 'zod';

// Status enums como constantes
export const statusFuncionarioEnum = [
  'EM_CONTRATACAO',
  'PERIODO_EXPERIENCIA',
  'ATIVO',
  'AVISO_PREVIO',
  'DESLIGADO',
] as const;

export const funcionarios = sqliteTable(
  'funcionarios',
  {
    id: idAutoIncrement(),
    nome: text('nome').notNull(),
    cpf: text('cpf').notNull(),
    dataNascimento: text('data_nascimento'),
    sexo: text('sexo'),
    nomeMae: text('nome_mae'),
    email: text('email'),
    telefone: text('telefone'),
    foto: text('foto'),
    // Dados profissionais
    cargoId: integer('cargo_id')
      .notNull()
      .references(() => cargos.id),
    departamentoId: integer('departamento_id')
      .notNull()
      .references(() => departamentos.id),
    empresaId: integer('empresa_id').references(() => empresas.id),
    unidadeId: integer('unidade_id').references(() => unidades.id),
    // Datas importantes
    dataAdmissao: text('data_admissao').notNull(),
    dataAvisoPrevio: text('data_aviso_previo'),
    dataDesligamento: text('data_desligamento'),
    // Status
    status: text('status', { enum: statusFuncionarioEnum }).notNull().default('ATIVO'),
    pontowebId: integer('pontoweb_id').unique(),
    criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
    atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index('funcionarios_cargo_id_idx').on(table.cargoId),
    index('funcionarios_departamento_id_idx').on(table.departamentoId),
    index('funcionarios_empresa_id_idx').on(table.empresaId),
  ],
);

export const userFuncionarios = sqliteTable(
  'user_funcionarios',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
      .unique(),
    funcionarioId: text('funcionario_id')
      .notNull()
      .references(() => funcionarios.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .unique(),
  },
  (table) => [unique('user_funcionarios_unique').on(table.userId, table.funcionarioId)],
);

export const equipeFuncionarios = sqliteTable(
  'equipes_funcionarios',
  {
    id: idAutoIncrement(),
    funcionarioId: text('funcionario_id')
      .notNull()
      .references(() => funcionarios.id, { onDelete: 'cascade' }),
    equipeId: integer('equipe_id')
      .notNull()
      .references(() => equipes.id, { onDelete: 'cascade' }),
    ehLider: integer('eh_lider', { mode: 'boolean' }).notNull().default(false),
    criadoEm: text('criado_em').default(sql`(CURRENT_TIMESTAMP)`),
    atualizadoEm: text('atualizado_em').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    unique('funcionarioEquipeUnique').on(table.funcionarioId, table.equipeId),
    index('equipes_funcionarios_funcionario_id_idx').on(table.funcionarioId),
    index('equipes_funcionarios_equipe_id_idx').on(table.equipeId),
  ],
);

export const funcionariosRelations = relations(funcionarios, ({ one, many }) => ({
  cargo: one(cargos, {
    fields: [funcionarios.cargoId],
    references: [cargos.id],
  }),
  departamento: one(departamentos, {
    fields: [funcionarios.departamentoId],
    references: [departamentos.id],
  }),
  empresa: one(empresas, {
    fields: [funcionarios.empresaId],
    references: [empresas.id],
  }),
  unidade: one(unidades, {
    fields: [funcionarios.unidadeId],
    references: [unidades.id],
  }),
  equipes: many(equipeFuncionarios),
  avaliacoesExperiencia: many(avaliacoesExperiencia),
  avaliacoesPeriodicas: many(avaliacoesPeriodicas),
  userFuncionario: one(userFuncionarios, {
    fields: [funcionarios.id],
    references: [userFuncionarios.funcionarioId],
  }),
}));

export const userFuncionariosRelations = relations(userFuncionarios, ({ one }) => ({
  user: one(users, {
    fields: [userFuncionarios.userId],
    references: [users.id],
  }),
  funcionario: one(funcionarios, {
    fields: [userFuncionarios.funcionarioId],
    references: [funcionarios.id],
  }),
}));

export const equipeFuncionariosRelations = relations(equipeFuncionarios, ({ one }) => ({
  funcionario: one(funcionarios, {
    fields: [equipeFuncionarios.funcionarioId],
    references: [funcionarios.id],
  }),
  equipe: one(equipes, {
    fields: [equipeFuncionarios.equipeId],
    references: [equipes.id],
  }),
}));

// ============ SCHEMAS DE FUNCIONÁRIOS ============

export const criarFuncionarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z
    .string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'CPF deve conter apenas números'),
  dataNascimento: z.string().optional(),
  sexo: z.enum(['M', 'F', 'Outro']).optional(),
  nomeMae: z.string().max(100, 'Nome da mãe deve ter no máximo 100 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  foto: z.string().url('URL da foto deve ser válida').optional(),
  cargoId: z.number().min(1, 'Cargo é obrigatório'),
  departamentoId: z.number().min(1, 'Departamento é obrigatório'),
  empresaId: z.number().min(1).optional(),
  unidadeId: z.number().min(1).optional(),
  dataAdmissao: z.string().min(1, 'Data de admissão é obrigatória'),
  dataAvisoPrevio: z.string().optional(),
  dataDesligamento: z.string().optional(),
  status: z.enum(statusFuncionarioEnum).default('ATIVO'),
  pontowebId: z.number().min(1).optional(),
});

export const atualizarFuncionarioSchema = criarFuncionarioSchema.partial();

export const filtrosFuncionariosSchema = z.object({
  busca: z.string().optional(),
  cargoId: z.number().min(1).optional(),
  departamentoId: z.number().min(1).optional(),
  empresaId: z.number().min(1).optional(),
  unidadeId: z.number().min(1).optional(),
  status: z.array(z.enum(statusFuncionarioEnum)).optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

export const alterarStatusFuncionarioSchema = z.object({
  status: z.enum(statusFuncionarioEnum),
  dataAvisoPrevio: z.string().optional(),
  dataDesligamento: z.string().optional(),
});

// ============ SCHEMAS DE RELACIONAMENTOS ============

export const criarUserFuncionarioSchema = z.object({
  userId: z.string().min(1, 'User ID é obrigatório'),
  funcionarioId: z.string().min(1, 'Funcionário ID é obrigatório'),
});

export const adicionarFuncionarioEquipeSchema = z.object({
  funcionarioId: z.string().min(1, 'Funcionário ID é obrigatório'),
  equipeId: z.number().min(1, 'Equipe ID é obrigatório'),
  ehLider: z.boolean().default(false),
});

export const atualizarEquipeFuncionarioSchema = z.object({
  ehLider: z.boolean().optional(),
});

export const filtrosEquipeFuncionariosSchema = z.object({
  funcionarioId: z.string().optional(),
  equipeId: z.number().min(1).optional(),
  ehLider: z.boolean().optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

export const filtrosUserFuncionariosSchema = z.object({
  userId: z.string().optional(),
  funcionarioId: z.string().optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

// ============ SCHEMAS PARA FORMULÁRIOS DO FRONTEND ============

// Schema para formulário de criar funcionário (com transformações)
export const formCriarFuncionarioSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .transform((val) => val.trim()),
  cpf: z
    .string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF inválido') // Aceita com máscara
    .transform((val) => val.replace(/\D/g, '')) // Remove não-dígitos
    .refine((val) => val.length === 11, 'CPF deve ter 11 dígitos'),
  dataNascimento: z.string().optional(),
  sexo: z.enum(['M', 'F', 'Outro']).optional(),
  nomeMae: z
    .string()
    .max(100, 'Nome da mãe deve ter no máximo 100 caracteres')
    .transform((val) => val.trim())
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .transform((val: string) => val.trim().toLowerCase())
    .optional(),
  telefone: z
    .string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .transform((val) => val.replace(/\D/g, '')) // Remove não-dígitos
    .optional(),
  foto: z.string().url('URL da foto deve ser válida').optional(),
  cargoId: z
    .string()
    .min(1, 'Cargo é obrigatório')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) {
        throw new Error('Cargo deve ser selecionado');
      }
      return num;
    }),
  departamentoId: z
    .string()
    .min(1, 'Departamento é obrigatório')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) {
        throw new Error('Departamento deve ser selecionado');
      }
      return num;
    }),
  empresaId: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) return undefined;
      return num;
    }),
  unidadeId: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) return undefined;
      return num;
    }),
  dataAdmissao: z.string().min(1, 'Data de admissão é obrigatória'),
  status: z.enum(statusFuncionarioEnum).default('ATIVO'),
});

// ============ TIPOS DERIVADOS ============

// Funcionários
export type CriarFuncionarioData = z.infer<typeof criarFuncionarioSchema>;
export type AtualizarFuncionarioData = z.infer<typeof atualizarFuncionarioSchema>;
export type FiltrosFuncionarios = z.infer<typeof filtrosFuncionariosSchema>;
export type AlterarStatusFuncionarioData = z.infer<typeof alterarStatusFuncionarioSchema>;

// Relacionamentos
export type CriarUserFuncionarioData = z.infer<typeof criarUserFuncionarioSchema>;
export type AdicionarFuncionarioEquipeData = z.infer<typeof adicionarFuncionarioEquipeSchema>;
export type AtualizarEquipeFuncionarioData = z.infer<typeof atualizarEquipeFuncionarioSchema>;
export type FiltrosEquipeFuncionarios = z.infer<typeof filtrosEquipeFuncionariosSchema>;
export type FiltrosUserFuncionarios = z.infer<typeof filtrosUserFuncionariosSchema>;

// Formulários
export type FormCriarFuncionarioData = z.infer<typeof formCriarFuncionarioSchema>;

// ============ TYPE ALIASES PARA ENUMS ============

export type StatusFuncionarioType = (typeof statusFuncionarioEnum)[number];

// ============ INTERFACES COMPLEMENTARES ============

export type Funcionario = InferSelectModel<typeof funcionarios> & {
  cargo?: Cargo;
  departamento?: Departamento;
  empresa?: Empresa | null;
  unidade?: Unidade | null;
  equipes?: InferSelectModel<typeof equipeFuncionarios> &
    {
      equipe?: Equipe;
    }[];
};
