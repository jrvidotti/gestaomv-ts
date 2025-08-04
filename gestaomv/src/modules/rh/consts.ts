import {
	classificacaoAvaliacaoPeriodicaEnum,
	recomendacaoAvaliacaoEnum,
	statusFuncionarioEnum,
	tipoAvaliacaoExperienciaEnum,
} from "./enums";

// Status Funcionário
export const STATUS_FUNCIONARIO = {
	EM_CONTRATACAO: "EM_CONTRATACAO",
	PERIODO_EXPERIENCIA: "PERIODO_EXPERIENCIA",
	ATIVO: "ATIVO",
	AVISO_PREVIO: "AVISO_PREVIO",
	DESLIGADO: "DESLIGADO",
} as const;

export const STATUS_FUNCIONARIO_OPTIONS = [
	{ value: "EM_CONTRATACAO", label: "Em Contratação" },
	{ value: "PERIODO_EXPERIENCIA", label: "Período de Experiência" },
	{ value: "ATIVO", label: "Ativo" },
	{ value: "AVISO_PREVIO", label: "Aviso Prévio" },
	{ value: "DESLIGADO", label: "Desligado" },
] as const;

export const STATUS_FUNCIONARIO_DATA = {
	EM_CONTRATACAO: { label: "Em Contratação", variant: "secondary" as const },
	PERIODO_EXPERIENCIA: {
		label: "Período de Experiência",
		variant: "secondary" as const,
	},
	ATIVO: { label: "Ativo", variant: "default" as const },
	AVISO_PREVIO: { label: "Aviso Prévio", variant: "destructive" as const },
	DESLIGADO: { label: "Desligado", variant: "outline" as const },
} as const;

// Recomendação Experiência
export const RECOMENDACAO_EXPERIENCIA = {
	EFETIVACAO: "EFETIVACAO",
	PRORROGACAO: "PRORROGACAO",
	DESLIGAMENTO: "DESLIGAMENTO",
} as const;

export const RECOMENDACAO_EXPERIENCIA_OPTIONS = [
	{ value: "EFETIVACAO", label: "Efetivação" },
	{ value: "PRORROGACAO", label: "Prorrogação" },
	{ value: "DESLIGAMENTO", label: "Desligamento" },
] as const;

export const RECOMENDACAO_EXPERIENCIA_DATA = {
	EFETIVACAO: { label: "Efetivação", variant: "default" as const },
	PRORROGACAO: { label: "Prorrogação", variant: "secondary" as const },
	DESLIGAMENTO: { label: "Desligamento", variant: "destructive" as const },
} as const;

// Classificação Avaliação Periódica
export const CLASSIFICACAO_PERIODICA = {
	EXCELENTE: "EXCELENTE",
	BOM: "BOM",
	SATISFATORIO: "SATISFATORIO",
	INSATISFATORIO: "INSATISFATORIO",
} as const;

export const CLASSIFICACAO_PERIODICA_OPTIONS = [
	{ value: "EXCELENTE", label: "Excelente" },
	{ value: "BOM", label: "Bom" },
	{ value: "SATISFATORIO", label: "Satisfatório" },
	{ value: "INSATISFATORIO", label: "Insatisfatório" },
] as const;

export const CLASSIFICACAO_PERIODICA_DATA = {
	EXCELENTE: { label: "Excelente", variant: "default" as const },
	BOM: { label: "Bom", variant: "default" as const },
	SATISFATORIO: { label: "Satisfatório", variant: "secondary" as const },
	INSATISFATORIO: { label: "Insatisfatório", variant: "destructive" as const },
} as const;

// Tipo Avaliação Experiência
export const TIPO_AVALIACAO_EXPERIENCIA = {
	AVALIACAO_45_DIAS: "AVALIACAO_45_DIAS",
	AVALIACAO_90_DIAS: "AVALIACAO_90_DIAS",
} as const;

export const TIPO_AVALIACAO_EXPERIENCIA_OPTIONS = [
	{ value: "AVALIACAO_45_DIAS", label: "45 Dias" },
	{ value: "AVALIACAO_90_DIAS", label: "90 Dias" },
] as const;

export const TIPO_AVALIACAO_EXPERIENCIA_DATA = {
	AVALIACAO_45_DIAS: { label: "45 Dias", variant: "secondary" as const },
	AVALIACAO_90_DIAS: { label: "90 Dias", variant: "default" as const },
} as const;
