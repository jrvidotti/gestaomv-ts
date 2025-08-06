import { idAutoIncrement } from "@/db/helpers";
import { unidades, users } from "@/modules/core/schemas";
import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { classificacaoNotaEnum, statusAvaliacaoEnum } from "../enums";
import { checklistItems, checklistTemplates } from "./templates";

// Avaliações realizadas
export const checklistAvaliacoes = sqliteTable(
	"checklist_avaliacoes",
	{
		id: idAutoIncrement(),
		templateId: integer("template_id")
			.notNull()
			.references(() => checklistTemplates.id),
		unidadeId: integer("unidade_id")
			.notNull()
			.references(() => unidades.id),
		avaliadorId: integer("avaliador_id")
			.notNull()
			.references(() => users.id),
		status: text("status", { enum: statusAvaliacaoEnum })
			.notNull()
			.default("PENDENTE"),
		dataAgendada: text("data_agendada"), // Data para quando deve ser feita
		dataInicio: text("data_inicio"), // Quando começou a avaliação
		dataFim: text("data_fim"), // Quando finalizou
		observacoes: text("observacoes"),
		mediaFinal: real("media_final"), // Média calculada das notas
		classificacao: text("classificacao", { enum: classificacaoNotaEnum }),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		index("checklist_avaliacoes_template_id_idx").on(table.templateId),
		index("checklist_avaliacoes_unidade_id_idx").on(table.unidadeId),
		index("checklist_avaliacoes_avaliador_id_idx").on(table.avaliadorId),
		index("checklist_avaliacoes_status_idx").on(table.status),
		index("checklist_avaliacoes_data_agendada_idx").on(table.dataAgendada),
	],
);

// Respostas individuais para cada item
export const checklistRespostas = sqliteTable(
	"checklist_respostas",
	{
		id: idAutoIncrement(),
		avaliacaoId: integer("avaliacao_id")
			.notNull()
			.references(() => checklistAvaliacoes.id, { onDelete: "cascade" }),
		itemId: integer("item_id")
			.notNull()
			.references(() => checklistItems.id),
		valorNota: integer("valor_nota"), // Para tipo "nota_1_5"
		valorBoolean: integer("valor_boolean", { mode: "boolean" }), // Para tipo "sim_nao"
		valorTexto: text("valor_texto"), // Para tipo "texto"
		observacao: text("observacao"), // Observação específica do item
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		index("checklist_respostas_avaliacao_id_idx").on(table.avaliacaoId),
		index("checklist_respostas_item_id_idx").on(table.itemId),
		// Constraint para garantir unicidade de resposta por item por avaliação
		index("checklist_respostas_unique_idx").on(table.avaliacaoId, table.itemId),
	],
);

// Relacionamentos
export const checklistAvaliacoesRelations = relations(
	checklistAvaliacoes,
	({ one, many }) => ({
		template: one(checklistTemplates, {
			fields: [checklistAvaliacoes.templateId],
			references: [checklistTemplates.id],
		}),
		unidade: one(unidades, {
			fields: [checklistAvaliacoes.unidadeId],
			references: [unidades.id],
		}),
		avaliador: one(users, {
			fields: [checklistAvaliacoes.avaliadorId],
			references: [users.id],
		}),
		respostas: many(checklistRespostas),
	}),
);

export const checklistRespostasRelations = relations(
	checklistRespostas,
	({ one }) => ({
		avaliacao: one(checklistAvaliacoes, {
			fields: [checklistRespostas.avaliacaoId],
			references: [checklistAvaliacoes.id],
		}),
		item: one(checklistItems, {
			fields: [checklistRespostas.itemId],
			references: [checklistItems.id],
		}),
	}),
);
