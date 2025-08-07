import { idAutoIncrement } from "@/db/helpers";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const consultasCpf = sqliteTable("factoring_consultas_cpf", {
	id: idAutoIncrement(),
	cpf: text("cpf").notNull().unique(),
	dados: text("dados").notNull().default("{}"),
	criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
});
