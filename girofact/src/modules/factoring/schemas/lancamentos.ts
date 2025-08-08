import { idAutoIncrement, timestamps } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { TipoLancamento } from "../enums";
import { TIPOS_LANCAMENTO_ARRAY } from "../enums";
import { carteiras } from "./carteiras";
import { clientes } from "./clientes";
import { ocorrencias } from "./ocorrencias";
import { operacoes } from "./operacoes";
import { recebimentos } from "./recebimentos";

export const lancamentos = sqliteTable("factoring_lancamentos", {
	id: idAutoIncrement(),
	clienteId: integer("cliente_id")
		.references(() => clientes.id, { onDelete: "restrict" })
		.notNull(),
	operacaoId: integer("operacao_id").references(() => operacoes.id, {
		onDelete: "restrict",
	}),
	ocorrenciaId: integer("ocorrencia_id").references(() => ocorrencias.id, {
		onDelete: "restrict",
	}),
	recebimentoId: integer("recebimento_id").references(() => recebimentos.id, {
		onDelete: "restrict",
	}),
	dataLancamento: text("data_lancamento").notNull(),
	valorLancamento: real("valor_lancamento").notNull(),
	tipoLancamento: text("tipo_lancamento", { enum: TIPOS_LANCAMENTO_ARRAY })
		.$type<TipoLancamento>()
		.notNull(),
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
export const lancamentosRelations = relations(lancamentos, ({ one }) => ({
	cliente: one(clientes, {
		fields: [lancamentos.clienteId],
		references: [clientes.id],
	}),
	operacao: one(operacoes, {
		fields: [lancamentos.operacaoId],
		references: [operacoes.id],
	}),
	ocorrencia: one(ocorrencias, {
		fields: [lancamentos.ocorrenciaId],
		references: [ocorrencias.id],
	}),
	recebimento: one(recebimentos, {
		fields: [lancamentos.recebimentoId],
		references: [recebimentos.id],
	}),
	carteira: one(carteiras, {
		fields: [lancamentos.carteiraId],
		references: [carteiras.id],
	}),
	user: one(users, {
		fields: [lancamentos.userId],
		references: [users.id],
	}),
}));
