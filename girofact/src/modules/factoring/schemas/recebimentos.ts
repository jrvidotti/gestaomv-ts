import { idAutoIncrement, timestamps } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { carteiras } from "./carteiras";
import { clientes } from "./clientes";

export const recebimentos = sqliteTable("factoring_recebimentos", {
	id: idAutoIncrement(),
	clienteId: integer("cliente_id")
		.references(() => clientes.id, { onDelete: "restrict" })
		.notNull(),
	dataRecebimento: text("data_recebimento").notNull(),
	valorRecebimento: real("valor_recebimento").notNull(),
	carteiraId: integer("carteira_id")
		.references(() => carteiras.id, { onDelete: "restrict" })
		.notNull(),
	observacao: text("observacao"),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "restrict" })
		.notNull(),
	...timestamps(),
});

// Relations
export const recebimentosRelations = relations(recebimentos, ({ one }) => ({
	cliente: one(clientes, {
		fields: [recebimentos.clienteId],
		references: [clientes.id],
	}),
	carteira: one(carteiras, {
		fields: [recebimentos.carteiraId],
		references: [carteiras.id],
	}),
	user: one(users, {
		fields: [recebimentos.userId],
		references: [users.id],
	}),
}));
