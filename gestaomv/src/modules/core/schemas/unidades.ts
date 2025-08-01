import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { idAutoIncrement } from "@/db/helpers";
import { empresas } from "./empresas";
import { funcionarios } from "@/modules/rh/schemas";

export const unidades = sqliteTable("unidades", {
	id: idAutoIncrement(),
	nome: text("nome").notNull(),
	codigo: integer("codigo").notNull().unique(),
	empresaId: integer("empresa_id").references(() => empresas.id),
	endereco: text("endereco"),
	cidade: text("cidade"),
	estado: text("estado"),
	telefone: text("telefone"),
	pontowebId: integer("pontoweb_id").unique(),
	criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
	atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
});

export const unidadesRelations = relations(unidades, ({ one, many }) => ({
	empresa: one(empresas, {
		fields: [unidades.empresaId],
		references: [empresas.id],
	}),
	funcionarios: many(funcionarios),
}));
