import { idAutoIncrement } from "@/db/helpers";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const consultasCnpj = sqliteTable("consultas_cnpj", {
	id: idAutoIncrement(),
	cnpj: text("cnpj").notNull().unique(),
	dados: text("dados").notNull().default("{}"),
	criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
});
