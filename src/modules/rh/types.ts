import type {
	avaliacoesExperiencia,
	avaliacoesPeriodicas,
	cargos,
	departamentos,
	equipeFuncionarios,
	equipes,
	funcionarios,
} from "@/db/schemas";
import type { Empresa, Unidade, User } from "@/modules/core/types";
import type { InferSelectModel } from "drizzle-orm";
import type {
	classificacaoAvaliacaoPeriodicaEnum,
	recomendacaoAvaliacaoEnum,
	statusFuncionarioEnum,
	tipoAvaliacaoExperienciaEnum,
} from "./enums";

export type Departamento = InferSelectModel<typeof departamentos> & {
	cargos?: Cargo[];
	funcionarios?: Funcionario[];
};

export type Equipe = InferSelectModel<typeof equipes> & {
	funcionarios?: InferSelectModel<typeof equipeFuncionarios> &
		{
			funcionario?: Funcionario;
		}[];
};

export type Cargo = InferSelectModel<typeof cargos> & {
	departamento?: Departamento;
	funcionarios?: Funcionario[];
};

export type Funcionario = InferSelectModel<typeof funcionarios> & {
	cargo?: Cargo;
	departamento?: Departamento;
	empresa?: Empresa | null;
	unidade?: Unidade | null;
	equipes?: InferSelectModel<typeof equipeFuncionarios> &
		{
			equipe?: Equipe;
		}[];
};

export type StatusFuncionarioType = (typeof statusFuncionarioEnum)[number];

export type TipoAvaliacaoExperienciaType =
	(typeof tipoAvaliacaoExperienciaEnum)[number];
export type RecomendacaoAvaliacaoType =
	(typeof recomendacaoAvaliacaoEnum)[number];
export type ClassificacaoAvaliacaoPeriodicaType =
	(typeof classificacaoAvaliacaoPeriodicaEnum)[number];

// ============ INTERFACES COMPLEMENTARES ============

export type AvaliacaoExperiencia = InferSelectModel<
	typeof avaliacoesExperiencia
> & {
	funcionario?: Funcionario;
	avaliador?: User;
};

export type AvaliacaoPeriodica = InferSelectModel<
	typeof avaliacoesPeriodicas
> & {
	funcionario?: Funcionario;
	avaliador?: User;
};
