import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/server/storage/storage.service';
import { config } from '@/server/config';
import jwt from 'jsonwebtoken';

// Instanciar o serviço de storage
const storageService = new StorageService();

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    // Aguardar params (Next.js 15 requirement)
    const resolvedParams = await params;

    // Verificar se o storage está configurado
    if (!storageService.isConfigurado()) {
      return NextResponse.json({ error: 'Serviço de storage não configurado' }, { status: 500 });
    }

    // Verificar autenticação JWT
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Token de autenticação não fornecido' }, { status: 401 });
    }

    try {
      jwt.verify(token, config.jwt.secret);
    } catch (error) {
      return NextResponse.json({ error: 'Token de autenticação inválido' }, { status: 401 });
    }

    // Construir chave do arquivo
    const chave = resolvedParams.path.join('/');

    if (!chave) {
      return NextResponse.json({ error: 'Caminho do arquivo não especificado' }, { status: 400 });
    }

    // Baixar arquivo do storage
    const buffer = await storageService.baixarArquivo(chave);

    // Determinar tipo MIME baseado na extensão
    const extensao = chave.substring(chave.lastIndexOf('.'));
    const tiposMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    const contentType = tiposMime[extensao.toLowerCase()] || 'application/octet-stream';

    // Retornar arquivo com headers apropriados
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', // Cache por 1 dia, revalidar por 1 semana
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Erro ao servir imagem:', error);

    // Verificar se é erro de arquivo não encontrado
    if (error instanceof Error && error.message.includes('não encontrado')) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

// Método não permitido para outras HTTP verbs
export async function POST() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 });
}
