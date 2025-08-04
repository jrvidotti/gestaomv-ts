import { NextResponse } from 'next/server';
import { config } from '@/server/config';
import fs from 'fs';
import path from 'path';
import { SystemInfoDTO, ErrorResponseDTO } from '@/shared/schemas/dto/superadmin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const databasePath = config.database.path.startsWith('.')
      ? path.join(process.cwd(), config.database.path)
      : config.database.path;
    const databaseExists = fs.existsSync(databasePath);
    const databaseStats = databaseExists ? fs.statSync(databasePath) : null;

    const systemInfo = {
      application: {
        name: packageJson.name || 'Gestão Corporativa',
        version: packageJson.version || '1.0.0',
        environment: config.env,
        nodeVersion: process.version,
      },
      database: {
        path: databasePath,
        exists: databaseExists,
        size: databaseStats ? `${(databaseStats.size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
        lastModified: databaseStats ? databaseStats.mtime.toISOString() : 'N/A',
      },
      server: {
        port: config.port,
        uptime: `${Math.floor(process.uptime())} segundos`,
        memoryUsage: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        },
      },
      timestamp: new Date().toISOString(),
    } satisfies SystemInfoDTO;

    return NextResponse.json(systemInfo);
  } catch (error) {
    console.error('Erro ao buscar informações do sistema:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' } satisfies ErrorResponseDTO, { status: 500 });
  }
}
