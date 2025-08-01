import { idAutoIncrement } from "@/db/helpers";
import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { equipeFuncionarios } from "./funcionarios";

export const equipes = sqliteTable("rh_equipes", {
	id: idAutoIncrement(),
	nome: text("nome").notNull(),
	codigo: text("codigo").notNull().unique(),
	criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
	atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
});

// Relacionamentos

export const equipesRelations = relations(equipes, ({ many }) => ({
	funcionarios: many(equipeFuncionarios),
}));
