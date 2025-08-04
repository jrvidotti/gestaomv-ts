import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/server/database/database';
import { criarUsuarioAdmin } from '@/utils/create-admin';
import { z } from 'zod';
import { createAdminSchema, CreateAdminResponseDTO, ErrorResponseDTO } from '@/shared/schemas/dto/superadmin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = createAdminSchema.parse(body);

    const db = getDatabase();
    const adminUser = await criarUsuarioAdmin(db, email, password, name);

    return NextResponse.json({
      success: true,
      message: 'Administrador criado com sucesso!',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
      },
      timestamp: new Date().toISOString(),
    } satisfies CreateAdminResponseDTO);
  } catch (error) {
    console.error('Erro ao criar administrador:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        } satisfies ErrorResponseDTO,
        { status: 400 },
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        error: 'Erro ao criar administrador',
        details: errorMessage,
      } satisfies ErrorResponseDTO,
      { status: 500 },
    );
  }
}
