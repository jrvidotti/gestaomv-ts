import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/server/storage/storage.service';

// Configurar limite de tamanho do upload (10MB)
export const maxDuration = 60; // 60 segundos timeout

// Instanciar o serviço de storage
const storageService = new StorageService();

export async function POST(request: NextRequest) {
  try {
    // Verificar se o storage está configurado
    if (!storageService.isConfigurado()) {
      return NextResponse.json({ error: 'Serviço de storage não configurado' }, { status: 500 });
    }

    // Obter FormData da requisição
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validar se o arquivo foi enviado
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo foi enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não suportado. Aceitos: ${allowedTypes.map((type) => type.split('/')[1]).join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Validar tamanho do arquivo (5MB máximo)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      return NextResponse.json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB' }, { status: 400 });
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fazer upload usando o StorageService
    const urlPublica = await storageService.fazerUploadArquivo(
      buffer,
      file.name,
      'materiais', // pasta específica para materiais
    );

    // Retornar URL pública do arquivo
    return NextResponse.json(
      {
        url: urlPublica,
        message: 'Upload realizado com sucesso',
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Erro no upload de arquivo:', error);

    // Verificar se é erro conhecido do StorageService
    const errorMessage = error instanceof Error ? error.message : 'Erro interno no servidor';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Método não permitido para outras HTTP verbs
export async function GET() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 });
}
