import { NextRequest, NextResponse } from 'next/server';
import { seedOperationSchema, SeedOperationResponseDTO, ErrorResponseDTO } from '@/shared/schemas/dto/superadmin';
import {
  executaOperacao,
  tabelasDisponiveis,
  ResultImportacao,
  ResultExportacao,
} from '@/server/database/import-export';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let operation: 'import' | 'export';

  try {
    const body = await request.json();
    const parsed = seedOperationSchema.parse(body);
    operation = parsed.operation;
  } catch (validationError) {
    return NextResponse.json(
      {
        error: 'Operação inválida. Use "import" ou "export".',
      } satisfies ErrorResponseDTO,
      { status: 400 },
    );
  }

  try {
    const resultados = await executaOperacao(tabelasDisponiveis, operation === 'export' ? 'exportar' : 'importar');
    const outputs: { timestamp: string; message: string }[] = [];

    // Log dos resultados para captura
    if (operation === 'export') {
      const resultadosExport = resultados as ResultExportacao[];

      // Adicionar mensagens de cada resultado
      resultadosExport.forEach((result) => {
        outputs.push({
          timestamp: result.timestamp ?? new Date().toISOString(),
          message: `${result.nomeArquivo} - ${result.exportados} exportados`,
        });
      });

      const totalExportados = resultadosExport.reduce((acc, res) => acc + res.exportados, 0);
      outputs.push({
        timestamp: new Date().toISOString(),
        message: `✅ Exportação concluída com sucesso! Total de registros exportados: ${totalExportados}`,
      });
    } else {
      const resultadosImport = resultados as ResultImportacao[];
      let arquivosNaoEncontrados = 0;

      // Adicionar mensagens de cada resultado
      resultadosImport.forEach((result) => {
        if (result.arquivoEncontrado) {
          outputs.push({
            timestamp: result.timestamp ?? new Date().toISOString(),
            message: `${result.nomeArquivo} - ${result.importados} importados, ${result.ignorados} ignorados, ${result.erros} erros`,
          });
        } else {
          arquivosNaoEncontrados++;
          outputs.push({
            timestamp: result.timestamp ?? new Date().toISOString(),
            message: `⚠️ Arquivo não encontrado para importação: ${result.nomeArquivo}`,
          });
        }
      });

      const totalImportados = resultadosImport.reduce((acc, res) => acc + res.importados, 0);
      const totalIgnorados = resultadosImport.reduce((acc, res) => acc + res.ignorados, 0);
      const totalErros = resultadosImport.reduce((acc, res) => acc + res.erros, 0);

      outputs.push({
        timestamp: new Date().toISOString(),
        message: `📊 Relatório Geral de Importação:`,
      });
      outputs.push({
        timestamp: new Date().toISOString(),
        message: `✅ Total importados: ${totalImportados}`,
      });
      outputs.push({
        timestamp: new Date().toISOString(),
        message: `⏭️  Total ignorados: ${totalIgnorados}`,
      });
      outputs.push({
        timestamp: new Date().toISOString(),
        message: `❌ Total erros: ${totalErros}`,
      });
      outputs.push({
        timestamp: new Date().toISOString(),
        message: `⚠️ Total arquivos não encontrados: ${arquivosNaoEncontrados}`,
      });

      if (totalErros === 0) {
        outputs.push({
          timestamp: new Date().toISOString(),
          message: '✅ Importação concluída com sucesso!',
        });
      } else {
        outputs.push({
          timestamp: new Date().toISOString(),
          message: '⚠️ Importação concluída com ressalvas. Verifique os erros acima.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      operation,
      outputs,
    } satisfies SeedOperationResponseDTO);
  } catch (error) {
    console.error(`Erro ao executar operação ${operation}:`, error);
    return NextResponse.json(
      {
        error: 'Erro ao executar operação',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      } satisfies ErrorResponseDTO,
      { status: 500 },
    );
  }
}
