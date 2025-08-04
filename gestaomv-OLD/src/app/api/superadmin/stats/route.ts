import { NextResponse } from 'next/server';
import { getDatabase } from '@/server/database/database';
import { users } from '@/shared/schemas/base/users';
import { empresas } from '@/shared/schemas/base/empresas';
import { unidades } from '@/shared/schemas/base/unidades';
import { funcionarios } from '@/shared/schemas/rh/funcionarios';
import { departamentos } from '@/shared/schemas/rh/departamentos';
import { equipes } from '@/shared/schemas/rh/equipes';
import { cargos } from '@/shared/schemas/rh/cargos';
import { materiais } from '@/shared/schemas/almoxarifado/materiais';
import { solicitacoesMaterial } from '@/shared/schemas/almoxarifado/solicitacoes_material';
import { count } from 'drizzle-orm';
import type { SQLiteTable, TableConfig } from 'drizzle-orm/sqlite-core';
import { SystemStatsDTO, ErrorResponseDTO } from '@/shared/schemas/dto/superadmin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getDatabase();

    // Função auxiliar para contar registros com tratamento de erro
    const safeCount = async (table: SQLiteTable<TableConfig>, tableName: string) => {
      try {
        const result = await db.select({ count: count() }).from(table);
        return result[0].count;
      } catch (error) {
        console.warn(`Tabela '${tableName}' não encontrada, retornando 0`);
        return 0;
      }
    };

    const [
      totalUsers,
      totalEmpresas,
      totalUnidades,
      totalFuncionarios,
      totalDepartamentos,
      totalEquipes,
      totalCargos,
      totalMateriais,
      totalSolicitacoes,
    ] = await Promise.all([
      safeCount(users, 'users'),
      safeCount(empresas, 'empresas'),
      safeCount(unidades, 'unidades'),
      safeCount(funcionarios, 'funcionarios'),
      safeCount(departamentos, 'departamentos'),
      safeCount(equipes, 'equipes'),
      safeCount(cargos, 'cargos'),
      safeCount(materiais, 'materiais'),
      safeCount(solicitacoesMaterial, 'solicitacoes_material'),
    ]);

    const stats = {
      base: {
        users: totalUsers,
        empresas: totalEmpresas,
        unidades: totalUnidades,
      },
      rh: {
        funcionarios: totalFuncionarios,
        departamentos: totalDepartamentos,
        equipes: totalEquipes,
        cargos: totalCargos,
      },
      almoxarifado: {
        materiais: totalMateriais,
        solicitacoes: totalSolicitacoes,
      },
    };

    return NextResponse.json(stats satisfies SystemStatsDTO);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' } satisfies ErrorResponseDTO, { status: 500 });
  }
}
