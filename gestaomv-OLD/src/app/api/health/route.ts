import { NextResponse } from 'next/server';
import { config } from '@/server/config';
import fs from 'fs';
import path from 'path';
import { getDatabase } from '@/server/database/database';
import { HealthCheckDTO, HealthStatus } from '@/shared/schemas/dto/superadmin';

export const runtime = 'nodejs';

interface AppliedMigration {
  hash: string;
  created_at: number;
}

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface Journal {
  version: string;
  dialect: string;
  entries: JournalEntry[];
}

async function getAppliedMigrations(db: ReturnType<typeof getDatabase>): Promise<AppliedMigration[]> {
  try {
    const result = (await db.all(`
      SELECT hash, created_at 
      FROM __drizzle_migrations 
      ORDER BY created_at ASC
    `)) as AppliedMigration[];
    return result;
  } catch (error) {
    return [];
  }
}

function loadJournal(migrationsFolder: string): Journal | null {
  try {
    const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
    const journalContent = fs.readFileSync(journalPath, 'utf8');
    return JSON.parse(journalContent) as Journal;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    const timestamp = new Date().toISOString();

    // Verificar se o banco de dados existe
    const databasePath = config.database.path.startsWith('.')
      ? path.join(process.cwd(), config.database.path)
      : config.database.path;

    const databaseExists = fs.existsSync(databasePath);

    if (!databaseExists) {
      return NextResponse.json({
        status: 'database_missing',
        message: 'Banco de dados não encontrado. É necessário executar as migrações iniciais.',
        timestamp,
      } satisfies HealthCheckDTO);
    }

    // Verificar migrações pendentes
    const db = getDatabase();
    const migrationsFolder = path.join(process.cwd(), 'src/server/database/migrations');

    const journal = loadJournal(migrationsFolder);
    if (!journal) {
      return NextResponse.json({
        status: 'ok',
        message: 'Sistema funcionando normalmente.',
        timestamp,
      } satisfies HealthCheckDTO);
    }

    const appliedMigrations = await getAppliedMigrations(db);
    const appliedTimestamps = new Set(appliedMigrations.map((m) => m.created_at));

    const pendingMigrations = journal.entries.filter((entry) => !appliedTimestamps.has(entry.when));
    const hasPendingMigrations = pendingMigrations.length > 0;

    let status: HealthStatus = 'ok';
    let message = 'Sistema funcionando normalmente.';

    if (hasPendingMigrations) {
      status = 'migrations_pending';
      message = 'Há alterações pendentes no banco de dados.';
    }

    return NextResponse.json({
      status,
      message,
      timestamp,
    } satisfies HealthCheckDTO);
  } catch (error) {
    console.error('Erro na verificação de health:', error);

    return NextResponse.json(
      {
        status: 'database_missing',
        message: 'Erro ao verificar o estado do sistema.',
        timestamp: new Date().toISOString(),
      } satisfies HealthCheckDTO,
      { status: 500 },
    );
  }
}
