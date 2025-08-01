import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { materiais } from ".";

// tabela de tipos de materiais - uso interno
export const tiposMaterial = sqliteTable("alm_tipos_material", {
	id: text("id").notNull().primaryKey(),
	nome: text("nome").notNull().unique(),
});

export const tiposMaterialRelations = relations(tiposMaterial, ({ many }) => ({
	materiais: many(materiais),
}));
