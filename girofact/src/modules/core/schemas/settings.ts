import { idAutoIncrement } from "@/db/helpers";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const configuracoes = sqliteTable("configuracoes", {
	id: idAutoIncrement(),
	key: text("key").notNull().unique(),
	value: text("value").notNull(),
	description: text("description"),
	category: text("category").notNull().default("general"),
	isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});
