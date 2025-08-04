import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@/shared';
import { ConfigService } from '@nestjs/config';

let db: ReturnType<typeof drizzle<typeof schema>>;

// Função para NestJS com ConfigService
export const createDatabase = (configService: ConfigService) => {
  const databaseUrl = configService.get<string>('database.path');
  if (!databaseUrl) {
    throw new Error('DATABASE_PATH is not set');
  }

  console.log('Inicializando banco de dados (NestJS):', databaseUrl);

  // Extrair o caminho do arquivo do DATABASE_PATH (remove "file:")
  const dbPath = databaseUrl.replace('file:', '');
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });

  console.log('Banco de dados inicializado com sucesso (NestJS)');
  return db;
};

// Função standalone para tRPC (sem dependencies)
export const initializeDatabase = () => {
  if (db) {
    return db; // Já inicializado
  }

  const databaseUrl = process.env.DATABASE_PATH;
  if (!databaseUrl) {
    throw new Error('DATABASE_PATH environment variable is not set');
  }

  console.log('Inicializando banco de dados (Standalone):', databaseUrl);

  // Extrair o caminho do arquivo do DATABASE_PATH (remove "file:")
  const dbPath = databaseUrl.replace('file:', '');
  const sqlite = new Database(dbPath);

  // Configurar SQLite para aceitar PRAGMA statements e foreign keys
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = normal');
  sqlite.pragma('temp_store = memory');
  sqlite.pragma('mmap_size = 268435456'); // 256MB

  db = drizzle(sqlite, { schema });

  console.log('Banco de dados inicializado com sucesso (Standalone)');
  return db;
};

export const getDatabase = () => {
  if (!db) {
    // Tentar inicializar automaticamente
    return initializeDatabase();
  }
  return db;
};

// Função específica para migrações com configuração adequada do SQLite
export const getDatabaseForMigrations = () => {
  const databaseUrl = process.env.DATABASE_PATH || './database.sqlite';

  console.log('Inicializando banco para migrações:', databaseUrl);

  // Extrair o caminho do arquivo do DATABASE_PATH (remove "file:")
  const dbPath = databaseUrl.replace('file:', '');
  const sqlite = new Database(dbPath);

  // Configurações específicas para migrações
  // Permitir que PRAGMA statements sejam executados durante migrações
  sqlite.pragma('foreign_keys = OFF'); // Desabilitar foreign keys por padrão
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = normal');

  // Retornar instância do drizzle com schema
  const migrationDb = drizzle(sqlite, { schema });

  console.log('Banco configurado para migrações com foreign keys desabilitadas');
  return { db: migrationDb, sqlite };
};

// Exportar db diretamente para compatibilidade
export { db };

export type Database = typeof db;
