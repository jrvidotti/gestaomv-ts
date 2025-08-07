import { z } from "zod";
import { STATUS_DOCUMENTO_ARRAY } from "../enums";

// Compensação em lote
export const compensacaoLoteSchema = z.object({
  documentos: z
    .array(
      z.object({
        id: z.number().positive(),
      })
    )
    .min(1, "Pelo menos um documento é obrigatório"),
  dataOcorrencia: z.date(),
  carteiraId: z.number().positive("Carteira é obrigatória"),
  observacao: z.string().optional(),
});

// Devolução
export const devolucaoDocumentoSchema = z.object({
  id: z.number().positive(),
  alineaDevolucao: z.string().min(1, "Alínea de devolução é obrigatória"),
  dataOcorrencia: z.date(),
  observacao: z.string().optional(),
});

// Prorrogação
export const prorrogacaoDocumentoSchema = z.object({
  id: z.number().positive(),
  dataVencimentoProrrogada: z.date(),
  valorJuros: z
    .number()
    .positive("Valor dos juros de prorrogação é obrigatório"),
  valorTarifa: z.number().min(0).optional(),
  observacao: z.string().optional(),
});

// Resgate
export const resgateDocumentoSchema = z.object({
  id: z.number().positive(),
  dataOcorrencia: z.date(),
  valorJuros: z.number().min(0).optional(),
  valorTarifa: z.number().min(0).optional(),
  observacao: z.string().optional(),
});

// Pagamento
export const pagamentoDocumentoSchema = z.object({
  id: z.number().positive(),
  dataOcorrencia: z.date(),
  valorJuros: z.number().min(0).optional(),
  valorTarifa: z.number().min(0).optional(),
  observacao: z.string().optional(),
});

export const findDocumentoSchema = z.object({
  id: z.number().positive(),
});

export const listDocumentosSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  operacaoId: z.number().positive().optional(),
  clienteId: z.number().positive().optional(),
  status: z.enum(STATUS_DOCUMENTO_ARRAY).optional(),
  tipoDocumento: z.enum(["nota_promissoria", "cheque"]).optional(),
  dataVencimentoInicio: z.date().optional(),
  dataVencimentoFim: z.date().optional(),
  vencidosAte: z.date().optional(), // Para buscar documentos vencidos até uma data
});

// Schema para agenda de vencimentos
export const agendaVencimentosSchema = z.object({
  dataInicio: z.date(),
  dataFim: z.date(),
  clienteId: z.number().positive().optional(),
  carteiraId: z.number().positive().optional(),
  incluirFloat: z.boolean().default(true),
});

// Posição de documentos
export const posicaoDocumentosSchema = z.object({
  dataReferencia: z.date().default(new Date()),
  clienteId: z.number().positive().optional(),
  status: z.enum(STATUS_DOCUMENTO_ARRAY).optional(),
  agruparPor: z.enum(["status", "cliente", "vencimento"]).default("status"),
});

// Schema para análise de inadimplência
export const analiseInadimplenciaSchema = z.object({
  dataReferencia: z.date().default(new Date()),
  faixasAtraso: z
    .array(
      z.object({
        diasMinimo: z.number().min(0),
        diasMaximo: z.number().positive(),
        descricao: z.string(),
      })
    )
    .default([
      { diasMinimo: 1, diasMaximo: 30, descricao: "1-30 dias" },
      { diasMinimo: 31, diasMaximo: 60, descricao: "31-60 dias" },
      { diasMinimo: 61, diasMaximo: 90, descricao: "61-90 dias" },
      { diasMinimo: 91, diasMaximo: 999999, descricao: "Acima de 90 dias" },
    ]),
  clienteId: z.number().positive().optional(),
});

export type CompensacaoLoteDto = z.infer<typeof compensacaoLoteSchema>;
export type DevolucaoDto = z.infer<typeof devolucaoDocumentoSchema>;
export type ProrrogacaoDto = z.infer<typeof prorrogacaoDocumentoSchema>;
export type ResgateDto = z.infer<typeof resgateDocumentoSchema>;
export type PagamentoDto = z.infer<typeof pagamentoDocumentoSchema>;

export type FindDto = z.infer<typeof findDocumentoSchema>;
export type ListDto = z.infer<typeof listDocumentosSchema>;
export type AgendaVencimentosDto = z.infer<typeof agendaVencimentosSchema>;
export type PosicaoDocumentosDto = z.infer<typeof posicaoDocumentosSchema>;
export type AnaliseInadimplenciaDto = z.infer<
  typeof analiseInadimplenciaSchema
>;
