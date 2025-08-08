import { idAutoIncrement, timestamps } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const carteiras = sqliteTable("factoring_carteiras", {
	id: idAutoIncrement(),
	nome: text("nome").notNull(),
	banco: text("banco"),
	agencia: text("agencia"),
	conta: text("conta"),
	chavePix: text("chave_pix"),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "restrict" })
		.notNull(),
	...timestamps(),
});

// Relations
export const carteirasRelations = relations(carteiras, ({ one }) => ({
	user: one(users, {
		fields: [carteiras.userId],
		references: [users.id],
	}),
}));
