import { z } from "zod";

// Schema genérico para paginação
export const paginationSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Schema para resposta paginada
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

// Schema para resposta de sucesso
export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
});

// Schema para filtros de data
export const dateRangeSchema = z
  .object({
    dataInicio: z.date(),
    dataFim: z.date(),
  })
  .superRefine((data, ctx) => {
    if (data.dataInicio >= data.dataFim) {
      ctx.addIssue({
        code: "custom",
        message: "Data inicial deve ser anterior à data final",
        path: ["dataInicio"],
      });
    }
  });

// Schema para busca com filtros comuns
export const searchFiltersSchema = z.object({
  search: z.string().optional(),
  ...paginationSchema.shape,
  ...dateRangeSchema.partial().shape,
});

// Schema para parâmetros de ID
export const idParamSchema = z.object({
  id: z.number().positive("ID deve ser um número positivo"),
});

// Schema para cálculos financeiros
export const calculosFinanceirosSchema = z.object({
  valorPrincipal: z.number().positive("Valor principal deve ser positivo"),
  taxaJuros: z.number().min(0).max(100, "Taxa deve estar entre 0% e 100%"),
  dias: z.number().positive("Dias deve ser positivo"),
  tipoJuros: z.enum(["simples", "composto"]).default("simples"),
});

// Schema para configurações do sistema
export const configuracoesSistemaSchema = z.object({
  tipoJurosPadrao: z.enum(["simples", "composto"]).default("simples"),
  taxaJurosPadrao: z.number().min(0).max(100).default(2.5), // % ao mês
  tarifaDevolucaoDefault: z.number().min(0).default(50),
  tarifaProrrogacaoDefault: z.number().min(0).default(25),
  tarifaProtestoDefault: z.number().min(0).default(15),
});

// Tipos
export type PaginationDto = z.infer<typeof paginationSchema>;
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
export type SuccessResponseDto = z.infer<typeof successResponseSchema>;
export type DateRangeDto = z.infer<typeof dateRangeSchema>;
export type SearchFiltersDto = z.infer<typeof searchFiltersSchema>;
export type IdParamDto = z.infer<typeof idParamSchema>;
export type CalculosFinanceirosDto = z.infer<typeof calculosFinanceirosSchema>;
export type ConfiguracoesSistemaDto = z.infer<
  typeof configuracoesSistemaSchema
>;
