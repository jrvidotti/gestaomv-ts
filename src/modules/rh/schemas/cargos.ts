import { idAutoIncrement } from "@/db/helpers";
import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { departamentos } from "./departamentos";
import { funcionarios } from "./funcionarios";

export const cargos = sqliteTable(
	"rh_cargos",
	{
		id: idAutoIncrement(),
		nome: text("nome").notNull().unique(),
		descricao: text("descricao"),
		departamentoId: integer("departamento_id")
			.notNull()
			.references(() => departamentos.id),
		pontowebId: integer("pontoweb_id").unique(),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [index("cargos_departamento_id_idx").on(table.departamentoId)],
);

// Relacionamentos

export const cargosRelations = relations(cargos, ({ one, many }) => ({
	departamento: one(departamentos, {
		fields: [cargos.departamentoId],
		references: [departamentos.id],
	}),
	funcionarios: many(funcionarios),
}));
