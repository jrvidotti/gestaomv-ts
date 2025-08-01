import z from "zod";

export const criarDepartamentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  pontowebId: z.number().min(1).optional(),
});

export const atualizarDepartamentoSchema = criarDepartamentoSchema.partial();

export const filtrosDepartamentosSchema = z.object({
  busca: z.string().optional(),
  pagina: z.number().min(1, 'Página deve ser maior que 0').default(1),
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(100, 'Limite máximo é 100').default(20),
});

export type CriarDepartamentoData = z.infer<typeof criarDepartamentoSchema>;
export type AtualizarDepartamentoData = z.infer<typeof atualizarDepartamentoSchema>;
export type FiltrosDepartamentos = z.infer<typeof filtrosDepartamentosSchema>;

