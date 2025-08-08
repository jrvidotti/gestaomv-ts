import { idAutoIncrement, timestamps } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { StatusOperacao } from "../enums";
import { STATUS_OPERACAO, STATUS_OPERACAO_ARRAY } from "../enums";
import { carteiras } from "./carteiras";
import { clientes } from "./clientes";
import { documentos } from "./documentos";

export const operacoes = sqliteTable("factoring_operacoes", {
	id: idAutoIncrement(),
	uid: text("uid").notNull().unique(),
	clienteId: integer("cliente_id")
		.references(() => clientes.id, { onDelete: "restrict" })
		.notNull(),
	taxaJuros: real("taxa_juros").notNull(),
	valorLiquido: real("valor_liquido"),
	status: text("status", { enum: STATUS_OPERACAO_ARRAY })
		.$type<StatusOperacao>()
		.notNull()
		.default(STATUS_OPERACAO.EFETIVADA),
	usuarioAprovadorId: integer("usuario_aprovador_id").references(
		() => users.id,
		{
			onDelete: "set null",
		},
	),
	dataAprovacao: text("data_aprovacao"),
	dataPagamento: text("data_pagamento"),
	carteiraId: integer("carteira_id").references(() => carteiras.id, {
		onDelete: "restrict",
	}),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "restrict" })
		.notNull(),
	observacoes: text("observacoes"),
	...timestamps(),
});

// Relations será definida após importar documentos
export const operacoesRelations = relations(operacoes, ({ one, many }) => ({
	cliente: one(clientes, {
		fields: [operacoes.clienteId],
		references: [clientes.id],
	}),
	carteira: one(carteiras, {
		fields: [operacoes.carteiraId],
		references: [carteiras.id],
	}),
	user: one(users, {
		fields: [operacoes.userId],
		references: [users.id],
	}),
	usuarioAprovador: one(users, {
		fields: [operacoes.usuarioAprovadorId],
		references: [users.id],
	}),
	documentos: many(documentos),
}));
