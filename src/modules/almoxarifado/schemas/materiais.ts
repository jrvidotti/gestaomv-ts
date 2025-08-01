import { idAutoIncrement } from "@/db/helpers";
import { relations, sql } from "drizzle-orm";
import {
	integer,
	real,
	sqliteTable,
	text,
	unique,
} from "drizzle-orm/sqlite-core";
import { solicitacoesMaterialItens, unidadesMedida } from ".";
import { tiposMaterial } from "./tipos_material";

export const materiais = sqliteTable(
	"alm_materiais",
	{
		id: idAutoIncrement(),
		tipoMaterialId: text("tipo_material_id")
			.notNull()
			.references(() => tiposMaterial.id),
		nome: text("nome").notNull(),
		unidadeMedidaId: text("unidade_medida_id")
			.notNull()
			.references(() => unidadesMedida.id),
		descricao: text("descricao"),
		valorUnitario: real("valor_unitario").notNull(),
		foto: text("foto"),
		ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		unique("materiais_unique").on(
			table.tipoMaterialId,
			table.nome,
			table.unidadeMedidaId,
		),
	],
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
