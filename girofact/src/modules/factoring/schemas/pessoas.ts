import { idAutoIncrement, timestamps } from "@/db/helpers";
import { relations } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { TipoPessoa } from "../enums";
import { TIPOS_PESSOA_ARRAY } from "../enums";

export const pessoas = sqliteTable("factoring_pessoas", {
	id: idAutoIncrement(),
	tipoPessoa: text("tipo_pessoa", { enum: TIPOS_PESSOA_ARRAY })
		.$type<TipoPessoa>()
		.notNull(),
	documento: text("documento").notNull().unique(),
	nomeRazaoSocial: text("nome_razao_social").notNull(),
	nomeFantasia: text("nome_fantasia"),
	dataNascimentoFundacao: text("data_nascimento_fundacao"),
	inscricaoEstadual: text("inscricao_estadual"),
	inscricaoMunicipal: text("inscricao_municipal"),
	nomeMae: text("nome_mae"),
	sexo: text("sexo", { enum: ["masculino", "feminino"] }),
	email: text("email"),

	// Endereço embutido
	cep: text("cep"),
	logradouro: text("logradouro"),
	numero: text("numero"),
	complemento: text("complemento"),
	bairro: text("bairro"),
	cidade: text("cidade"),
	estado: text("estado"),

	observacoesGerais: text("observacoes_gerais"),
	...timestamps(),
});

// Relations
export const pessoasRelations = relations(pessoas, ({ many }) => ({
	telefones: many(telefones),
	dadosBancarios: many(dadosBancarios),
}));

// Tabelas relacionadas
export const telefones = sqliteTable("factoring_telefones", {
	id: idAutoIncrement(),
	pessoaId: integer("pessoa_id")
		.references(() => pessoas.id, { onDelete: "cascade" })
		.notNull(),
	numero: text("numero").notNull(),
	principal: integer("principal", { mode: "boolean" }).notNull().default(false),
	whatsapp: integer("whatsapp", { mode: "boolean" }).notNull().default(false),
	inativo: integer("inativo", { mode: "boolean" }).notNull().default(false),
	...timestamps(),
});

export const dadosBancarios = sqliteTable(
	"factoring_dados_bancarios",
	{
		id: idAutoIncrement(),
		pessoaId: integer("pessoa_id")
			.references(() => pessoas.id, { onDelete: "cascade" })
			.notNull(),
		banco: text("banco").notNull(),
		agencia: text("agencia").notNull(),
		conta: text("conta").notNull(),
		digitoVerificador: text("digito_verificador").notNull(),
		tipoConta: text("tipo_conta", { enum: ["corrente", "poupanca"] })
			.notNull()
			.default("corrente"),
		...timestamps(),
	},
	(table) => [
		uniqueIndex("unique_banco_agencia_conta").on(
			table.banco,
			table.agencia,
			table.conta,
		),
	],
);

// Relations para tabelas relacionadas
export const telefonesRelations = relations(telefones, ({ one }) => ({
	pessoa: one(pessoas, {
		fields: [telefones.pessoaId],
		references: [pessoas.id],
	}),
}));

export const dadosBancariosRelations = relations(dadosBancarios, ({ one }) => ({
	pessoa: one(pessoas, {
		fields: [dadosBancarios.pessoaId],
		references: [pessoas.id],
	}),
}));
