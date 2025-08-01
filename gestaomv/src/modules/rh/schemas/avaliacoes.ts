import { idAutoIncrement } from "@/db/helpers";
import { users } from "@/modules/core/schemas";
import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import {
	classificacaoAvaliacaoPeriodicaEnum,
	recomendacaoAvaliacaoEnum,
	tipoAvaliacaoExperienciaEnum,
} from "../enums";
import { funcionarios } from "./funcionarios";

export const avaliacoesExperiencia = sqliteTable(
	"rh_avaliacoes_experiencia",
	{
		id: idAutoIncrement(),
		funcionarioId: integer("funcionario_id")
			.notNull()
			.references(() => funcionarios.id),
		avaliadorId: integer("avaliador_id")
			.notNull()
			.references(() => users.id),
		// Período avaliado
		tipo: text("tipo", { enum: tipoAvaliacaoExperienciaEnum }).notNull(),
		dataAvaliacao: text("data_avaliacao").notNull(),
		// Critérios de avaliação (escala de 1-5)
		pontualidade: integer("pontualidade").notNull(),
		comprometimento: integer("comprometimento").notNull(),
		trabalhoEquipe: integer("trabalho_equipe").notNull(),
		iniciativa: integer("iniciativa").notNull(),
		comunicacao: integer("comunicacao").notNull(),
		conhecimentoTecnico: integer("conhecimento_tecnico").notNull(),
		// Média e recomendação
		mediaFinal: real("media_final").notNull(),
		recomendacao: text("recomendacao", {
			enum: recomendacaoAvaliacaoEnum,
		}).notNull(),
		// Observações
		pontosFortes: text("pontos_fortes"),
		pontosMelhoria: text("pontos_melhoria"),
		observacoes: text("observacoes"),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		index("avaliacoes_experiencia_funcionario_id_idx").on(table.funcionarioId),
		index("avaliacoes_experiencia_avaliador_id_idx").on(table.avaliadorId),
	],
);

export const avaliacoesPeriodicas = sqliteTable(
	"rh_avaliacoes_periodicas",
	{
		id: idAutoIncrement(),
		funcionarioId: integer("funcionario_id")
			.notNull()
			.references(() => funcionarios.id),
		avaliadorId: integer("avaliador_id")
			.notNull()
			.references(() => users.id),
		// Período avaliado
		periodoInicial: text("periodo_inicial").notNull(),
		periodoFinal: text("periodo_final").notNull(),
		dataAvaliacao: text("data_avaliacao").notNull(),
		// Critérios de avaliação (escala de 1-5)
		desempenho: integer("desempenho").notNull(),
		comprometimento: integer("comprometimento").notNull(),
		trabalhoEquipe: integer("trabalho_equipe").notNull(),
		lideranca: integer("lideranca").notNull(),
		comunicacao: integer("comunicacao").notNull(),
		inovacao: integer("inovacao").notNull(),
		resolucaoProblemas: integer("resolucao_problemas").notNull(),
		qualidadeTrabalho: integer("qualidade_trabalho").notNull(),
		// Média e classificação
		mediaFinal: real("media_final").notNull(),
		classificacao: text("classificacao", {
			enum: classificacaoAvaliacaoPeriodicaEnum,
		}).notNull(),
		// Metas e observações
		metasAnterior: text("metas_anterior"),
		avaliacaoMetas: text("avaliacao_metas"),
		novasMetas: text("novas_metas"),
		feedbackGeral: text("feedback_geral"),
		planoDesenvolvimento: text("plano_desenvolvimento"),
		criadoEm: text("criado_em").default(sql`(CURRENT_TIMESTAMP)`),
		atualizadoEm: text("atualizado_em").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [
		index("avaliacoes_periodicas_funcionario_id_idx").on(table.funcionarioId),
		index("avaliacoes_periodicas_avaliador_id_idx").on(table.avaliadorId),
	],
);

// Relacionamentos

export const avaliacoesExperienciaRelations = relations(
	avaliacoesExperiencia,
	({ one }) => ({
		funcionario: one(funcionarios, {
			fields: [avaliacoesExperiencia.funcionarioId],
			references: [funcionarios.id],
		}),
		avaliador: one(users, {
			fields: [avaliacoesExperiencia.avaliadorId],
			references: [users.id],
		}),
	}),
);

export const avaliacoesPeriodicasRelations = relations(
	avaliacoesPeriodicas,
	({ one }) => ({
		funcionario: one(funcionarios, {
			fields: [avaliacoesPeriodicas.funcionarioId],
			references: [funcionarios.id],
		}),
		avaliador: one(users, {
			fields: [avaliacoesPeriodicas.avaliadorId],
			references: [users.id],
		}),
	}),
);
