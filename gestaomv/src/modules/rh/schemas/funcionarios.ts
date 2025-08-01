import { idAutoIncrement } from "@/db/helpers";
import { empresas, unidades, users } from "@/modules/core/schemas";
import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	unique,
} from "drizzle-orm/sqlite-core";
import { statusFuncionarioEnum } from "../enums";
import { avaliacoesExperiencia, avaliacoesPeriodicas } from "./avaliacoes";
import { cargos } from "./cargos";
import { departamentos } from "./departamentos";
import { equipes } from "./equipes";

export const funcionarios = sqliteTable(
	"rh_funcionarios",
	{
		id: idAutoIncrement(),
		nome: text("nome").notNull(),
		cpf: text("cpf").notNull(),
		dataNascimento: text("data_nascimento"),
		sexo: text("sexo"),
		nomeMae: text("nome_mae"),
		email: text("email"),
		telefone: text("telefone"),
		foto: text("foto"),
		// Dados profissionais
		cargoId: integer("cargo_id")
			.notNull()
			.references(() => cargos.id),
		departamentoId: integer("departamento_id")
			.notNull()
			.references(() => departamentos.id),
		empresaId: integer("empresa_id").references(() => empresas.id),
		unidadeId: integer("unidade_id").references(() => unidades.id),
		// Datas importantes
		dataAdmissao: text("data_admissao").notNull(),
		dataAvisoPrevio: text("data_aviso_previo"),
		dataDesligamento: text("data_desligamento"),
		// Status
		status: text("status", { enum: statusFuncionarioEnum })
			.notNull()
			.default("ATIVO"),
		pontowebId: integer("pontoweb_id").unique(),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		index("funcionarios_cargo_id_idx").on(table.cargoId),
		index("funcionarios_departamento_id_idx").on(table.departamentoId),
		index("funcionarios_empresa_id_idx").on(table.empresaId),
	],
);

export const userFuncionarios = sqliteTable(
	"rh_user_funcionarios",
	{
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
			.unique(),
		funcionarioId: text("funcionario_id")
			.notNull()
			.references(() => funcionarios.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			})
			.unique(),
	},
	(table) => [
		unique("user_funcionarios_unique").on(table.userId, table.funcionarioId),
	],
);

export const equipeFuncionarios = sqliteTable(
	"rh_equipes_funcionarios",
	{
		id: idAutoIncrement(),
		funcionarioId: text("funcionario_id")
			.notNull()
			.references(() => funcionarios.id, { onDelete: "cascade" }),
		equipeId: integer("equipe_id")
			.notNull()
			.references(() => equipes.id, { onDelete: "cascade" }),
		ehLider: integer("eh_lider", { mode: "boolean" }).notNull().default(false),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		unique("funcionarioEquipeUnique").on(table.funcionarioId, table.equipeId),
		index("equipes_funcionarios_funcionario_id_idx").on(table.funcionarioId),
		index("equipes_funcionarios_equipe_id_idx").on(table.equipeId),
	],
);

export const funcionariosRelations = relations(
	funcionarios,
	({ one, many }) => ({
		cargo: one(cargos, {
			fields: [funcionarios.cargoId],
			references: [cargos.id],
		}),
		departamento: one(departamentos, {
			fields: [funcionarios.departamentoId],
			references: [departamentos.id],
		}),
		empresa: one(empresas, {
			fields: [funcionarios.empresaId],
			references: [empresas.id],
		}),
		unidade: one(unidades, {
			fields: [funcionarios.unidadeId],
			references: [unidades.id],
		}),
		equipes: many(equipeFuncionarios),
		avaliacoesExperiencia: many(avaliacoesExperiencia),
		avaliacoesPeriodicas: many(avaliacoesPeriodicas),
		userFuncionario: one(userFuncionarios, {
			fields: [funcionarios.id],
			references: [userFuncionarios.funcionarioId],
		}),
	}),
);

export const userFuncionariosRelations = relations(
	userFuncionarios,
	({ one }) => ({
		user: one(users, {
			fields: [userFuncionarios.userId],
			references: [users.id],
		}),
		funcionario: one(funcionarios, {
			fields: [userFuncionarios.funcionarioId],
			references: [funcionarios.id],
		}),
	}),
);

export const equipeFuncionariosRelations = relations(
	equipeFuncionarios,
	({ one }) => ({
		funcionario: one(funcionarios, {
			fields: [equipeFuncionarios.funcionarioId],
			references: [funcionarios.id],
		}),
		equipe: one(equipes, {
			fields: [equipeFuncionarios.equipeId],
			references: [equipes.id],
		}),
	}),
);
