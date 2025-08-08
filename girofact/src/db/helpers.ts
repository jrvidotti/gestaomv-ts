import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

export const idCuid = () =>
	text("id")
		.primaryKey()
		.$defaultFn(() => createId());
export const idAutoIncrement = () =>
	integer("id").primaryKey({ autoIncrement: true });

export const criadoEm = () =>
	text("criado_em").default(sql`(CURRENT_TIMESTAMP)`);
export const atualizadoEm = () =>
	text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`);
export const timestamps = () => ({
	criadoEm: criadoEm(),
	atualizadoEm: atualizadoEm(),
});
