export const TIPO_PESSOA = {
  FISICA: "fisica",
  JURIDICA: "juridica",
} as const;

export type TipoPessoa = (typeof TIPO_PESSOA)[keyof typeof TIPO_PESSOA];

export const STATUS_CLIENTE = {
  ATIVO: "ativo",
  INATIVO: "inativo",
  BLOQUEADO: "bloqueado",
  SUSPENSO: "suspenso",
} as const;

export type StatusCliente =
  (typeof STATUS_CLIENTE)[keyof typeof STATUS_CLIENTE];

export const STATUS_OPERACAO = {
  RASCUNHO: "rascunho",
  APROVACAO: "aprovacao",
  EFETIVADA: "efetivada",
  LIQUIDADA: "liquidada",
  CANCELADA: "cancelada",
} as const;

export type StatusOperacao =
  (typeof STATUS_OPERACAO)[keyof typeof STATUS_OPERACAO];

export const TIPO_DOCUMENTO = {
  NOTA_PROMISSORIA: "nota_promissoria",
  CHEQUE: "cheque",
} as const;

export type TipoDocumento =
  (typeof TIPO_DOCUMENTO)[keyof typeof TIPO_DOCUMENTO];

export const STATUS_DOCUMENTO = {
  PENDENTE: "pendente",
  COMPENSADO: "compensado",
  DEVOLVIDO: "devolvido",
  PROTESTADO: "protestado",
  RESGATADO: "resgatado",
  PAGO: "pago",
} as const;

export type StatusDocumento =
  (typeof STATUS_DOCUMENTO)[keyof typeof STATUS_DOCUMENTO];

export const TIPO_OCORRENCIA = {
  COMPENSACAO: "compensacao",
  DEVOLUCAO: "devolucao",
  PROTESTO: "protesto",
  PRORROGACAO: "prorrogacao",
  RESGATE: "resgate",
  PAGAMENTO: "pagamento",
} as const;

export type TipoOcorrencia =
  (typeof TIPO_OCORRENCIA)[keyof typeof TIPO_OCORRENCIA];

export const TIPO_CONTA_BANCARIA = {
  CORRENTE: "corrente",
  POUPANCA: "poupanca",
} as const;

export type TipoContaBancaria =
  (typeof TIPO_CONTA_BANCARIA)[keyof typeof TIPO_CONTA_BANCARIA];

export const TIPO_REFERENCIA = {
  SOCIO: "socio",
  FUNCIONARIO: "funcionario",
  REFERENCIA_PESSOAL: "referencia_pessoal",
  REFERENCIA_COMERCIAL: "referencia_comercial",
} as const;

export type TipoReferencia =
  (typeof TIPO_REFERENCIA)[keyof typeof TIPO_REFERENCIA];

export const TIPO_LANCAMENTO = {
  ENTRADA: "entrada",
  SAIDA: "saida",
} as const;

export type TipoLancamento =
  (typeof TIPO_LANCAMENTO)[keyof typeof TIPO_LANCAMENTO];

export const TIPO_ENTIDADE_ANEXO = {
  PESSOA: "pessoa",
  CLIENTE: "cliente",
  DOCUMENTO: "documento",
  OPERACAO: "operacao",
} as const;

export type TipoEntidadeAnexo =
  (typeof TIPO_ENTIDADE_ANEXO)[keyof typeof TIPO_ENTIDADE_ANEXO];

export const TIPO_ARQUIVO = {
  DOCUMENTO: "documento",
  COMPROVANTE: "comprovante",
  FOTO: "foto",
  ANEXO_GERAL: "anexo_geral",
} as const;

export type TipoArquivo = (typeof TIPO_ARQUIVO)[keyof typeof TIPO_ARQUIVO];

export const STATUS_ANEXO = {
  ATIVO: "ativo",
  ARQUIVADO: "arquivado",
} as const;

export type StatusAnexo = (typeof STATUS_ANEXO)[keyof typeof STATUS_ANEXO];

export const TIPO_JUROS = {
  SIMPLES: "simples",
  COMPOSTO: "composto",
} as const;

export type TipoJuros = (typeof TIPO_JUROS)[keyof typeof TIPO_JUROS];

// Arrays para uso em validações Zod
export const TIPOS_PESSOA_ARRAY = Object.values(TIPO_PESSOA) as [
  TipoPessoa,
  ...TipoPessoa[],
];
export const STATUS_CLIENTE_ARRAY = Object.values(STATUS_CLIENTE) as [
  StatusCliente,
  ...StatusCliente[],
];
export const STATUS_OPERACAO_ARRAY = Object.values(STATUS_OPERACAO) as [
  StatusOperacao,
  ...StatusOperacao[],
];
export const TIPOS_DOCUMENTO_ARRAY = Object.values(TIPO_DOCUMENTO) as [
  TipoDocumento,
  ...TipoDocumento[],
];
export const STATUS_DOCUMENTO_ARRAY = Object.values(STATUS_DOCUMENTO) as [
  StatusDocumento,
  ...StatusDocumento[],
];
export const TIPOS_OCORRENCIA_ARRAY = Object.values(TIPO_OCORRENCIA) as [
  TipoOcorrencia,
  ...TipoOcorrencia[],
];
export const TIPOS_CONTA_BANCARIA_ARRAY = Object.values(
  TIPO_CONTA_BANCARIA
) as [TipoContaBancaria, ...TipoContaBancaria[]];
export const TIPOS_REFERENCIA_ARRAY = Object.values(TIPO_REFERENCIA) as [
  TipoReferencia,
  ...TipoReferencia[],
];
export const TIPOS_LANCAMENTO_ARRAY = Object.values(TIPO_LANCAMENTO) as [
  TipoLancamento,
  ...TipoLancamento[],
];
export const TIPOS_ENTIDADE_ANEXO_ARRAY = Object.values(
  TIPO_ENTIDADE_ANEXO
) as [TipoEntidadeAnexo, ...TipoEntidadeAnexo[]];
export const TIPOS_ARQUIVO_ARRAY = Object.values(TIPO_ARQUIVO) as [
  TipoArquivo,
  ...TipoArquivo[],
];
export const STATUS_ANEXO_ARRAY = Object.values(STATUS_ANEXO) as [
  StatusAnexo,
  ...StatusAnexo[],
];
export const TIPOS_JUROS_ARRAY = Object.values(TIPO_JUROS) as [
  TipoJuros,
  ...TipoJuros[],
];
