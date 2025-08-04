import { NextResponse } from 'next/server';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDatabase, getDatabaseForMigrations } from '@/server/database/database';
import path from 'path';
import fs from 'fs';
import {
  MigrationInfoDTO,
  MigrationResponseDTO,
  ErrorResponseDTO,
  MigrationStatusDTO,
} from '@/shared/schemas/dto/superadmin';

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
    // Tentar consultar a tabela de migrações do Drizzle
    const result = (await db.all(`
      SELECT hash, created_at 
      FROM __drizzle_migrations 
      ORDER BY created_at ASC
    `)) as AppliedMigration[];
    return result;
  } catch (error) {
    // Tabela não existe ainda
    return [];
  }
}

function loadJournal(migrationsFolder: string): Journal | null {
  try {
    const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
    const journalContent = fs.readFileSync(journalPath, 'utf8');
    return JSON.parse(journalContent) as Journal;
  } catch (error) {
    console.warn('Não foi possível carregar _journal.json:', error);
    return null;
  }
}

export async function GET() {
  try {
    const db = getDatabase();
    const migrationsFolder = path.join(process.cwd(), 'src/server/database/migrations');

    // Carregar journal com informações das migrações
    const journal = loadJournal(migrationsFolder);
    if (!journal) {
      return NextResponse.json(
        { error: 'Não foi possível carregar o journal de migrações' } satisfies ErrorResponseDTO,
        { status: 500 },
      );
    }

    // Obter migrações já aplicadas no banco
    const appliedMigrations = await getAppliedMigrations(db);

    // Criar um Set dos timestamps aplicados para busca rápida
    const appliedTimestamps = new Set(appliedMigrations.map((m) => m.created_at));

    // Determinar status de cada migração baseado no journal
    const migrationsStatus: MigrationStatusDTO[] = journal.entries.map((entry) => {
      const filename = `${entry.tag}.sql`;

      // Verificar se esta migração foi aplicada comparando o timestamp 'when' com 'created_at'
      // O Drizzle usa o 'when' do journal como created_at na tabela __drizzle_migrations
      const isApplied = appliedTimestamps.has(entry.when);

      return {
        filename,
        tag: entry.tag,
        when: entry.when,
        idx: entry.idx,
        status: isApplied ? 'applied' : 'pending',
        appliedAt: new Date(entry.when),
      };
    });

    const summary = {
      total: journal.entries.length,
      applied: migrationsStatus.filter((m) => m.status === 'applied').length,
      pending: migrationsStatus.filter((m) => m.status === 'pending').length,
    };

    return NextResponse.json({
      migrationFiles: journal.entries.map((entry) => `${entry.tag}.sql`),
      migrationsFolder,
      appliedMigrations,
      migrationsStatus,
      summary,
      journal,
      totalMigrations: journal.entries.length,
    } satisfies MigrationInfoDTO);
  } catch (error) {
    console.error('Erro ao listar migrações:', error);
    return NextResponse.json({ error: 'Erro ao listar migrações' } satisfies ErrorResponseDTO, { status: 500 });
  }
}

async function runMigrationsWithForeignKeyControl() {
  const { db, sqlite } = getDatabaseForMigrations();
  const migrationsFolder = path.join(process.cwd(), 'src/server/database/migrations');

  try {
    console.log('🔄 Aplicando migrações do Drizzle...');
    console.log('📋 Verificando foreign keys antes da migração...');

    // Verificar se há violações de foreign key antes de iniciar
    const foreignKeyCheck = sqlite.prepare('PRAGMA foreign_key_check').all();
    if (foreignKeyCheck.length > 0) {
      console.warn('⚠️ Violações de foreign key detectadas:', foreignKeyCheck);
    }

    // Executar migrações
    migrate(db, { migrationsFolder });

    // Verificar novamente após migrações
    const postMigrationCheck = sqlite.prepare('PRAGMA foreign_key_check').all();
    if (postMigrationCheck.length > 0) {
      console.warn('⚠️ Violações de foreign key após migração:', postMigrationCheck);
      throw new Error('Migrações resultaram em violações de foreign key');
    }

    console.log('✅ Migrações aplicadas com sucesso!');
    console.log('✅ Verificação de foreign keys passou!');

    // Fechar conexão específica de migração
    sqlite.close();

    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao aplicar migrações:', error);

    // Tentar fechar conexão mesmo em caso de erro
    try {
      sqlite.close();
    } catch (closeError) {
      console.warn('Erro ao fechar conexão:', closeError);
    }

    throw error;
  }
}

export async function POST() {
  try {
    await runMigrationsWithForeignKeyControl();

    return NextResponse.json({
      success: true,
      message: 'Migrações aplicadas com sucesso!',
      timestamp: new Date().toISOString(),
    } satisfies MigrationResponseDTO);
  } catch (error) {
    console.error('❌ Erro ao aplicar migrações:', error);
    return NextResponse.json(
      {
        error: 'Erro ao aplicar migrações',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      } satisfies ErrorResponseDTO,
      { status: 500 },
    );
  }
}
