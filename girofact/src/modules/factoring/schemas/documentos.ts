import { idAutoIncrement, timestamps } from "@/db/helpers";
import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { StatusDocumento, TipoDocumento } from "../enums";
import { STATUS_DOCUMENTO_ARRAY, TIPOS_DOCUMENTO_ARRAY } from "../enums";
import { ocorrencias } from "./ocorrencias";
import { operacoes } from "./operacoes";
import { dadosBancarios, pessoas } from "./pessoas";

export const documentos = sqliteTable("factoring_documentos", {
	id: idAutoIncrement(),
	uid: text("uid").notNull().unique(),
	operacaoId: integer("operacao_id")
		.references(() => operacoes.id, { onDelete: "restrict" })
		.notNull(),
	tipoDocumento: text("tipo_documento", { enum: TIPOS_DOCUMENTO_ARRAY })
		.$type<TipoDocumento>()
		.notNull(),
	dataVencimento: text("data_vencimento").notNull(),
	valorDocumento: real("valor_documento").notNull(),
	float: integer("float").notNull().default(0),
	dataVencimentoProrrogada: text("data_vencimento_prorrogada"),
	status: text("status", { enum: STATUS_DOCUMENTO_ARRAY })
		.$type<StatusDocumento>()
		.notNull()
		.default("pendente"),
	valorJurosOperacao: real("valor_juros_operacao").notNull().default(0),
	observacoes: text("observacoes"),
	foiDevolvido: integer("foi_devolvido", { mode: "boolean" })
		.notNull()
		.default(false),

	// Campos específicos para Nota Promissória
	emitenteId: integer("emitente_id").references(() => pessoas.id, {
		onDelete: "restrict",
	}),
	avalistaId: integer("avalista_id").references(() => pessoas.id, {
		onDelete: "set null",
	}),
	numeroDocumento: text("numero_documento"), // Se em branco, usa o ID do documento

	// Campos específicos para Cheque
	dadosBancariosId: integer("dados_bancarios_id").references(
		() => dadosBancarios.id,
		{ onDelete: "restrict" },
	),
	numeroCheque: text("numero_cheque"),

	...timestamps(),
});

// Relations
export const documentosRelations = relations(documentos, ({ one, many }) => ({
	operacao: one(operacoes, {
		fields: [documentos.operacaoId],
		references: [operacoes.id],
	}),
	emitente: one(pessoas, {
		fields: [documentos.emitenteId],
		references: [pessoas.id],
	}),
	avalista: one(pessoas, {
		fields: [documentos.avalistaId],
		references: [pessoas.id],
	}),
	dadosBancarios: one(dadosBancarios, {
		fields: [documentos.dadosBancariosId],
		references: [dadosBancarios.id],
	}),
	ocorrencias: many(ocorrencias),
}));
