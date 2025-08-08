import { idAutoIncrement } from "@/db/helpers";
import { unidades, users } from "@/modules/core/schemas";
import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { materiais } from ".";
import { STATUS_SOLICITACAO, STATUS_SOLICITACAO_ARRAY } from "../enums";
import type { StatusSolicitacaoType } from "../types";

export const solicitacoesMaterial = sqliteTable(
	"alm_solicitacoes_material",
	{
		id: idAutoIncrement(),
		solicitanteId: integer("solicitante_id")
			.notNull()
			.references(() => users.id),
		unidadeId: integer("unidade_id")
			.notNull()
			.references(() => unidades.id),
		aprovadorId: integer("aprovador_id").references(() => users.id),
		atendidoPorId: integer("atendido_por_id").references(() => users.id),
		dataOperacao: text("data_operacao")
			.default(sql`(CURRENT_TIMESTAMP)`)
			.notNull(),
		dataAprovacao: text("data_aprovacao"),
		dataAtendimento: text("data_atendimento"),
		status: text("status", { enum: STATUS_SOLICITACAO_ARRAY })
			.notNull()
			.$type<StatusSolicitacaoType>()
			.default(STATUS_SOLICITACAO.PENDENTE),
		observacoes: text("observacoes"),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		index("solicitacoes_material_data_operacao_idx").on(table.dataOperacao),
		index("solicitacoes_material_solicitante_id_idx").on(table.solicitanteId),
		index("solicitacoes_material_unidade_id_idx").on(table.unidadeId),
		index("solicitacoes_material_aprovador_id_idx").on(table.aprovadorId),
		index("solicitacoes_material_atendido_por_id_idx").on(table.atendidoPorId),
	],
);

export const solicitacoesMaterialItens = sqliteTable(
	"alm_solicitacoes_material_itens",
	{
		id: idAutoIncrement(),
		solicitacaoMaterialId: integer("solicitacao_material_id")
			.notNull()
			.references(() => solicitacoesMaterial.id, { onDelete: "cascade" }),
		materialId: integer("material_id")
			.notNull()
			.references(() => materiais.id),
		qtdSolicitada: integer("qtd_solicitada").notNull(),
		qtdAtendida: integer("qtd_atendida"),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		index("solicitacoes_material_itens_solicitacao_material_id_idx").on(
			table.solicitacaoMaterialId,
		),
		index("solicitacoes_material_itens_material_id_idx").on(table.materialId),
	],
);

// ===== RELATIONS =====

export const solicitacoesMaterialRelations = relations(
	solicitacoesMaterial,
	({ one, many }) => ({
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
			relationName: "SolicitacaoAprovador",
		}),
		atendidoPor: one(users, {
			fields: [solicitacoesMaterial.atendidoPorId],
			references: [users.id],
			relationName: "SolicitacaoAtendente",
		}),
		itens: many(solicitacoesMaterialItens),
	}),
);

export const solicitacoesMaterialItensRelations = relations(
	solicitacoesMaterialItens,
	({ one }) => ({
		solicitacaoMaterial: one(solicitacoesMaterial, {
			fields: [solicitacoesMaterialItens.solicitacaoMaterialId],
			references: [solicitacoesMaterial.id],
		}),
		material: one(materiais, {
			fields: [solicitacoesMaterialItens.materialId],
			references: [materiais.id],
		}),
	}),
);
