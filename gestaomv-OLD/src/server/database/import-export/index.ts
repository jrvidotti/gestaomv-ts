import { config } from '@/server/config';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface MetadadosArquivo {
  exportadoEm: string;
  totalRegistros: number;
  versao: string;
  descricao: string;
}

export interface ArquivoSeed<T> {
  metadata: MetadadosArquivo;
  dados: T[];
}

export interface ResultImportacao {
  nomeArquivo?: string;
  importados: number;
  ignorados: number;
  erros: number;
  timestamp?: string;
  arquivoEncontrado: boolean;
}

export interface ResultExportacao {
  nomeArquivo?: string;
  exportados: number;
  timestamp?: string;
}

export interface ImportExportOptions<T> {
  nomeArquivo?: string;
  descricaoArquivo: string;
  buscarItens: () => Promise<T[]>;
  importarItem: (item: T) => Promise<boolean>;
}

export class ImportExport<T> {
  private resultImportacao: ResultImportacao;

  constructor(private options: ImportExportOptions<T>) {
    this.resultImportacao = {
      nomeArquivo: options.nomeArquivo,
      importados: 0,
      ignorados: 0,
      erros: 0,
      arquivoEncontrado: false,
    };
  }

  private criarMetadados(totalRegistros: number, descricao: string): MetadadosArquivo {
    return {
      exportadoEm: new Date().toISOString(),
      totalRegistros,
      versao: '1.0.0',
      descricao,
    };
  }

  private salvarArquivo<T>(dados: T[], caminhoArquivo: string) {
    const arquivo: ArquivoSeed<T> = {
      metadata: this.criarMetadados(dados.length, this.options.descricaoArquivo),
      dados,
    };

    writeFileSync(caminhoArquivo, JSON.stringify(arquivo, null, 2), 'utf-8');
  }

  async exportar(caminhoArquivo: string): Promise<ResultExportacao> {
    const itens = await this.options.buscarItens();
    this.salvarArquivo(itens, caminhoArquivo);

    return {
      nomeArquivo: this.options.nomeArquivo,
      exportados: itens.length,
    };
  }

  private lerArquivoSeed(caminhoArquivo: string): ArquivoSeed<T> | null {
    if (!existsSync(caminhoArquivo)) {
      return null;
    }

    const conteudo = readFileSync(caminhoArquivo, 'utf-8');
    return JSON.parse(conteudo) as ArquivoSeed<T>;
  }

  async importar(caminhoArquivo: string) {
    const arquivo = this.lerArquivoSeed(caminhoArquivo);
    if (!arquivo) {
      return this.resultImportacao;
    }

    this.resultImportacao.arquivoEncontrado = true;

    for (const item of arquivo.dados) {
      try {
        if (await this.options.importarItem(item)) {
          this.resultImportacao.importados++;
        } else {
          this.resultImportacao.ignorados++;
        }
      } catch (error) {
        this.resultImportacao.erros++;
      }
    }

    return this.resultImportacao;
  }
}

export const tabelasDisponiveis = [
  'users',
  'tipos-material',
  'unidades-medida',
  'consultas-cpf',
  'empresas',
  'unidades',
  'departamentos',
  'equipes',
  'cargos',
  'materiais',
];

export async function executaOperacao(tabelas: string[], operacao: 'importar' | 'exportar') {
  const configs: ImportExportOptions<never>[] = [];

  for (const tabela of tabelas) {
    try {
      const { config } = (await import(`./${tabela}`)) as { config: ImportExportOptions<never> };
      configs.push({ ...config, nomeArquivo: tabela });
    } catch (error) {
      console.error(`Erro ao importar config de ${tabela}:`, error);
    }
  }

  return Promise.all(
    configs.map(async (importExportConfig) => {
      const importador = new ImportExport(importExportConfig);
      const caminhoArquivo = join(config.database.files, `${importExportConfig.nomeArquivo!}.json`);
      const result =
        operacao === 'importar' ? await importador.importar(caminhoArquivo) : await importador.exportar(caminhoArquivo);
      return {
        ...result,
        timestamp: new Date().toISOString(),
      };
    }),
  );
}
