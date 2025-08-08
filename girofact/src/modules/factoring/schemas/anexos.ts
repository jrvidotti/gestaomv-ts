import { idAutoIncrement, timestamps } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { StatusAnexo, TipoArquivo } from "../enums";
import {
	STATUS_ANEXO_ARRAY,
	TIPOS_ARQUIVO_ARRAY,
} from "../enums";
import { pessoas, clientes, operacoes, documentos } from "./index";

export const anexos = sqliteTable("factoring_anexos", {
	id: idAutoIncrement(),
	pessoaId: integer("pessoa_id")
		.references(() => pessoas.id, { onDelete: "cascade" }),
	clienteId: integer("cliente_id")
		.references(() => clientes.id, { onDelete: "cascade" }),
	operacaoId: integer("operacao_id")
		.references(() => operacoes.id, { onDelete: "cascade" }),
	documentoId: integer("documento_id")
		.references(() => documentos.id, { onDelete: "cascade" }),
	observacao: text("observacao"),
	tipoArquivo: text("tipo_arquivo", { enum: TIPOS_ARQUIVO_ARRAY })
		.$type<TipoArquivo>()
		.notNull(),
	chaveArquivoS3: text("chave_arquivo_s3"),
	nomeArquivo: text("nome_arquivo"),
	tamanhoArquivo: integer("tamanho_arquivo"),
	tipoMime: text("tipo_mime"),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "restrict" })
		.notNull(),
	status: text("status", { enum: STATUS_ANEXO_ARRAY })
		.$type<StatusAnexo>()
		.notNull()
		.default("ativo"),
	...timestamps(),
});

// Relations
export const anexosRelations = relations(anexos, ({ one }) => ({
	user: one(users, {
		fields: [anexos.userId],
		references: [users.id],
	}),
	pessoa: one(pessoas, {
		fields: [anexos.pessoaId],
		references: [pessoas.id],
	}),
	cliente: one(clientes, {
		fields: [anexos.clienteId],
		references: [clientes.id],
	}),
	operacao: one(operacoes, {
		fields: [anexos.operacaoId],
		references: [operacoes.id],
	}),
	documento: one(documentos, {
		fields: [anexos.documentoId],
		references: [documentos.id],
	}),
}));
