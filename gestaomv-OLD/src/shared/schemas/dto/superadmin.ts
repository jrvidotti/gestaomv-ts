import { z } from 'zod';

// DTO para criação de administrador
export const createAdminSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  name: z.string().optional().default('Administrador'),
});

export type CreateAdminDTO = z.infer<typeof createAdminSchema>;

// DTO para resposta de criação de administrador
export interface CreateAdminResponseDTO {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  timestamp: string;
}

// DTO para operação de seed
export const seedOperationSchema = z.object({
  operation: z.enum(['import', 'export'], {
    message: 'Operação deve ser "import" ou "export"',
  }),
});

export type SeedOperationDTO = z.infer<typeof seedOperationSchema>;

// DTO para resposta de operação de seed
export interface SeedOperationResponseDTO {
  success: boolean;
  operation: 'import' | 'export';
  outputs: { timestamp: string; message: string }[];
}

// DTO para estatísticas do sistema
export interface SystemStatsDTO {
  base: {
    users: number;
    empresas: number;
    unidades: number;
  };
  rh: {
    funcionarios: number;
    departamentos: number;
    equipes: number;
    cargos: number;
  };
  almoxarifado: {
    materiais: number;
    solicitacoes: number;
  };
}

// DTO para informações do sistema
export interface SystemInfoDTO {
  application: {
    name: string;
    version: string;
    environment: string;
    nodeVersion: string;
  };
  database: {
    path: string;
    exists: boolean;
    size: string;
    lastModified: string;
  };
  server: {
    port: number;
    uptime: string;
    memoryUsage: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
    };
  };
  timestamp: string;
}

// DTO para status de migração
export interface MigrationStatusDTO {
  filename: string;
  tag: string;
  when: number;
  idx: number;
  status: 'applied' | 'pending' | 'unknown';
  appliedAt?: Date;
}

// DTO para informações de migração
export interface MigrationInfoDTO {
  migrationFiles: string[];
  migrationsFolder: string;
  appliedMigrations: Array<{
    hash: string;
    created_at: number;
  }>;
  migrationsStatus: MigrationStatusDTO[];
  summary: {
    total: number;
    applied: number;
    pending: number;
  };
  journal: unknown;
  totalMigrations: number;
}

// DTO para resposta de migração
export interface MigrationResponseDTO {
  success: boolean;
  message: string;
  timestamp: string;
}

// DTO para resposta de erro padrão
export interface ErrorResponseDTO {
  error: string;
  details?:
    | string
    | Array<{
        field: string;
        message: string;
      }>;
}

// DTO para verificação de saúde do sistema
export type HealthStatus = 'ok' | 'database_missing' | 'migrations_pending';

export interface HealthCheckDTO {
  status: HealthStatus;
  message: string;
  timestamp: string;
}
