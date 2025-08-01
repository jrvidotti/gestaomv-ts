import type {
	AvaliacaoExperiencia,
	AvaliacaoPeriodica,
	ClassificacaoAvaliacaoPeriodicaType,
	Departamento,
	Funcionario,
} from "../types";
import type {
	FiltrosAvaliacoesExperiencia,
	FiltrosAvaliacoesPeriodicas,
} from "./avaliacoes";
import type { FiltrosFuncionarios } from "./funcionarios";

// ============ INTERFACES PARA DASHBOARDS E ESTATÍSTICAS ============

export interface EstatisticasRH {
	totalFuncionarios: number;
	funcionariosAtivos: number;
	funcionariosExperiencia: number;
	funcionariosDesligados: number;
	totalDepartamentos: number;
	totalCargos: number;
	totalEquipes: number;
	funcionariosPorStatus: {
		EM_CONTRATACAO: number;
		PERIODO_EXPERIENCIA: number;
		ATIVO: number;
		AVISO_PREVIO: number;
		DESLIGADO: number;
	};
	avaliacoesPendentes: number;
	mediaAvaliacoes: number;
}

export interface FuncionariosPorDepartamento {
	departamentoId: number;
	departamentoNome: string;
	totalFuncionarios: number;
	funcionariosAtivos: number;
}

export interface AvaliacoesPorClassificacao {
	classificacao: ClassificacaoAvaliacaoPeriodicaType;
	quantidade: number;
	percentual: number;
}

export interface FuncionarioAniversariante {
	id: number;
	nome: string;
	email?: string;
	foto?: string;
	dataNascimento: string;
	diasParaAniversario: number;
	cargo: {
		nome: string;
	};
	departamento: {
		nome: string;
	};
}

export interface AdmissaoRecente {
	id: number;
	nome: string;
	email?: string;
	foto?: string;
	dataAdmissao: string;
	diasNaEmpresa: number;
	cargo: {
		nome: string;
	};
	departamento: {
		nome: string;
	};
}

// ============ INTERFACES PARA RELATÓRIOS ============

export interface RelatorioFuncionarios {
	funcionarios: Funcionario[];
	filtrosAplicados: FiltrosFuncionarios;
	totalRegistros: number;
	dataGeracao: string;
}

export interface RelatorioAvaliacoes {
	avaliacoes: (AvaliacaoExperiencia | AvaliacaoPeriodica)[];
	tipoRelatorio: "EXPERIENCIA" | "PERIODICA";
	filtrosAplicados: FiltrosAvaliacoesExperiencia | FiltrosAvaliacoesPeriodicas;
	totalRegistros: number;
	mediaGeral: number;
	dataGeracao: string;
}

export interface RelatorioOrganograma {
	departamentos: Departamento[];
	totalFuncionarios: number;
	dataGeracao: string;
}
