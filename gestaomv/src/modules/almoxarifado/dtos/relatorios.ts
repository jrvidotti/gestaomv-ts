import { z } from 'zod';

// ============ SCHEMAS DE DASHBOARD/ESTATÍSTICAS ============

export const filtroEstatisticasSchema = z.object({
  dataInicial: z.date().optional(),
  dataFinal: z.date().optional(),
  status: z.string().optional(),
});

export const topMateriaisSchema = z.object({
  limite: z.number().min(1, 'Limite deve ser maior que 0').max(50, 'Limite máximo é 50').default(10),
  dataInicial: z.date().optional(),
  dataFinal: z.date().optional(),
  status: z.string().optional(),
});

// ============ TIPOS DERIVADOS ============

export type FiltroEstatisticas = z.infer<typeof filtroEstatisticasSchema>;
export type TopMateriaisParams = z.infer<typeof topMateriaisSchema>;

// ============ OUTROS ESQUEMAS ============

export interface EstatisticasAlmoxarifado {
  totalSolicitacoes: number;
  materiaisAtivos: number;
  unidadesAtivas: number;
  valorTotalSolicitado: number;
  solicitacoesPorStatus: {
    pendente: number;
    aprovada: number;
    rejeitada: number;
    atendida: number;
  };
}
