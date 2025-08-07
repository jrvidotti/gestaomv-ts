import { idAutoIncrement, timestamps } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { StatusAnexo, TipoArquivo, TipoEntidadeAnexo } from "../enums";
import {
	STATUS_ANEXO_ARRAY,
	TIPOS_ARQUIVO_ARRAY,
	TIPOS_ENTIDADE_ANEXO_ARRAY,
} from "../enums";

export const anexos = sqliteTable("factoring_anexos", {
	id: idAutoIncrement(),
	tipoEntidade: text("tipo_entidade", { enum: TIPOS_ENTIDADE_ANEXO_ARRAY })
		.$type<TipoEntidadeAnexo>()
		.notNull(),
	idEntidade: integer("id_entidade").notNull(),
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
}));
