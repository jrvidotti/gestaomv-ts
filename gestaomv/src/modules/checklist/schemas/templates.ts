import { idAutoIncrement } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { periodicidadeEnum, tipoItemChecklistEnum } from "../enums";

// Templates de checklist (configurações base)
export const checklistTemplates = sqliteTable(
	"checklist_templates",
	{
		id: idAutoIncrement(),
		nome: text("nome").notNull(),
		descricao: text("descricao"),
		periodicidade: text("periodicidade", { enum: periodicidadeEnum }).notNull(),
		ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),
		criadoPorId: integer("criado_por_id")
			.notNull()
			.references(() => users.id),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		index("checklist_templates_nome_idx").on(table.nome),
		index("checklist_templates_ativo_idx").on(table.ativo),
		index("checklist_templates_criado_por_idx").on(table.criadoPorId),
	],
);

// Itens individuais dos templates
export const checklistItems = sqliteTable(
	"checklist_items",
	{
		id: idAutoIncrement(),
		templateId: integer("template_id")
			.notNull()
			.references(() => checklistTemplates.id, { onDelete: "cascade" }),
		titulo: text("titulo").notNull(),
		descricao: text("descricao"),
		tipo: text("tipo", { enum: tipoItemChecklistEnum }).notNull(),
		obrigatorio: integer("obrigatorio", { mode: "boolean" })
			.notNull()
			.default(true),
		peso: real("peso").notNull().default(1.0), // Peso para cálculo da média
		ordem: integer("ordem").notNull(), // Ordem de exibição
		ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		index("checklist_items_template_id_idx").on(table.templateId),
		index("checklist_items_ordem_idx").on(table.templateId, table.ordem),
		index("checklist_items_ativo_idx").on(table.ativo),
	],
);

// Relacionamentos
export const checklistTemplatesRelations = relations(
	checklistTemplates,
	({ one, many }) => ({
		criadoPor: one(users, {
			fields: [checklistTemplates.criadoPorId],
			references: [users.id],
		}),
		itens: many(checklistItems),
		avaliacoes: many(checklistAvaliacoes),
	}),
);

export const checklistItemsRelations = relations(
	checklistItems,
	({ one, many }) => ({
		template: one(checklistTemplates, {
			fields: [checklistItems.templateId],
			references: [checklistTemplates.id],
		}),
		respostas: many(checklistRespostas),
	}),
);

// Import necessário para evitar erro de referência circular
import { checklistAvaliacoes, checklistRespostas } from "./avaliacoes";
