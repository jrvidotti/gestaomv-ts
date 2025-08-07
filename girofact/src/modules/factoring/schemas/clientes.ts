import { idAutoIncrement, timestamps } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import type { HistoricoLimiteDto } from "@/modules/factoring/dtos/clientes";
import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { StatusCliente, TipoReferencia } from "../enums";
import { STATUS_CLIENTE_ARRAY, TIPOS_REFERENCIA_ARRAY } from "../enums";
import { pessoas } from "./pessoas";

export const clientes = sqliteTable("factoring_clientes", {
	id: idAutoIncrement(),
	pessoaId: integer("pessoa_id")
		.references(() => pessoas.id, { onDelete: "restrict" })
		.notNull()
		.unique(),
	status: text("status", { enum: STATUS_CLIENTE_ARRAY })
		.$type<StatusCliente>()
		.notNull()
		.default("ativo"),
	observacoesCliente: text("observacoes_cliente"),
	creditoAutorizado: integer("credito_autorizado", { mode: "boolean" })
		.notNull()
		.default(false),
	limiteCredito: real("limite_credito").notNull().default(0),
	taxaJurosPadrao: real("taxa_juros_padrao").notNull().default(0),
	tarifaDevolucaoCheques: real("tarifa_devolucao_cheques"),
	tarifaProrrogacao: real("tarifa_prorrogacao"),
	tarifaProtesto: real("tarifa_protesto"),
	tarifaResgate: real("tarifa_resgate"),
	dataUltimaAnaliseCredito: text("data_ultima_analise_credito"),
	usuarioResponsavelAnalise: integer("usuario_responsavel_analise").references(
		() => users.id,
		{ onDelete: "set null" },
	),
	historicoAlteracoesLimite: text("historico_alteracoes_limite", {
		mode: "json",
	}).$type<HistoricoLimiteDto[]>(),
	...timestamps(),
});

export const contatosReferencia = sqliteTable("factoring_contatos_referencia", {
	id: idAutoIncrement(),
	clienteId: integer("cliente_id")
		.references(() => clientes.id, { onDelete: "cascade" })
		.notNull(),
	tipoReferencia: text("tipo_referencia", { enum: TIPOS_REFERENCIA_ARRAY })
		.$type<TipoReferencia>()
		.notNull(),
	pessoaId: integer("pessoa_id").references(() => pessoas.id, {
		onDelete: "set null",
	}), // Opcional
	nomeCompleto: text("nome_completo"),
	telefone: text("telefone").notNull(),
	email: text("email"),
	documento: text("documento"),
	empresaOrganizacao: text("empresa_organizacao"),
	cargoFuncao: text("cargo_funcao"),
	observacoes: text("observacoes"),
	...timestamps(),
});

// Relations
export const clientesRelations = relations(clientes, ({ one, many }) => ({
	pessoa: one(pessoas, {
		fields: [clientes.pessoaId],
		references: [pessoas.id],
	}),
	usuarioResponsavel: one(users, {
		fields: [clientes.usuarioResponsavelAnalise],
		references: [users.id],
	}),
	contatosReferencia: many(contatosReferencia),
}));

export const contatosReferenciaRelations = relations(
	contatosReferencia,
	({ one }) => ({
		cliente: one(clientes, {
			fields: [contatosReferencia.clienteId],
			references: [clientes.id],
		}),
		pessoa: one(pessoas, {
			fields: [contatosReferencia.pessoaId],
			references: [pessoas.id],
		}),
	}),
);
