import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { materiais } from ".";

// tabela de unidades de medida - uso interno
export const unidadesMedida = sqliteTable("alm_unidades_medida", {
	id: text("id").notNull().primaryKey(),
	nome: text("nome").notNull().unique(),
});

export const unidadesMedidaRelations = relations(
	unidadesMedida,
	({ many }) => ({
		materiais: many(materiais),
	}),
);
