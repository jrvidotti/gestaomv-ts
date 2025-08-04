import { z } from 'zod';

// ============ INTERFACE DE RESULTADO DE IMPORTAÇÃO ============

export interface ResultadoImportacao {
  empresas: {
    importadas: number;
    atualizadas: number;
    erros: string[];
  };
  unidades: {
    importadas: number;
    atualizadas: number;
    erros: string[];
  };
  departamentos: {
    importadas: number;
    atualizadas: number;
    erros: string[];
  };
  cargos: {
    importados: number;
    atualizados: number;
    erros: string[];
  };
  funcionarios: {
    importados: number;
    atualizados: number;
    ignorados: number;
    erros: string[];
  };
}

// ============ SCHEMAS PARA PROCEDURES TRPC ============

export const importarFuncionariosSchema = z.object({
  modoAtualizar: z.boolean().optional().default(false),
});

export const sincronizarAfastamentosSchema = z.object({
  diasRetroativos: z.number().min(1).max(365).optional().default(30),
});

// ============ INTERFACES PARA RESULTADOS ============

export interface ResultadoSincronizacaoAfastamentos {
  afastamentos: number;
  erros: string[];
}

export interface MotivosDemissao {
  motivos: Array<{
    id: number;
    descricao: string;
    codigo?: string;
    ativo: boolean;
  }>;
  erros: string[];
}

// ============ TIPOS DERIVADOS ============

export type ImportarFuncionariosData = z.infer<typeof importarFuncionariosSchema>;
export type SincronizarAfastamentosData = z.infer<typeof sincronizarAfastamentosSchema>;
