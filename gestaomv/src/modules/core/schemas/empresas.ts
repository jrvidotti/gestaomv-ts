import { idAutoIncrement } from "@/db/helpers";
import { funcionarios } from "@/modules/rh/schemas";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { unidades } from "./unidades";

export const empresas = sqliteTable("empresas", {
	id: idAutoIncrement(),
	razaoSocial: text("razao_social").notNull(),
	nomeFantasia: text("nome_fantasia"),
	cnpj: text("cnpj").notNull().unique(),
	pontowebId: integer("pontoweb_id").unique(),
	criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
	atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
});

export const empresasRelations = relations(empresas, ({ many }) => ({
	unidades: many(unidades),
	funcionarios: many(funcionarios),
}));
