import { idAutoIncrement } from "@/db/helpers";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cargos } from "./cargos";
import { funcionarios } from "./funcionarios";

export const departamentos = sqliteTable("rh_departamentos", {
	id: idAutoIncrement(),
	nome: text("nome").notNull().unique(),
	descricao: text("descricao"),
	pontowebId: integer("pontoweb_id").unique(),
	criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
	atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
});

// Relacionamentos

export const departamentosRelations = relations(departamentos, ({ many }) => ({
	cargos: many(cargos),
	funcionarios: many(funcionarios),
}));
