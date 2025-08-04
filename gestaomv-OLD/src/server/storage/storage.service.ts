import { Injectable, Logger } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from '../config';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null = null;
  private readonly bucket: string;

  constructor() {
    this.bucket = config.s3.bucket;

    // Verificar se todas as configurações S3 necessárias estão presentes
    if (!config.s3.accessKeyId || !config.s3.secretAccessKey) {
      this.logger.warn('Configurações S3 incompletas. Funcionalidade de storage desabilitada.');
      return;
    }

    try {
      this.client = new S3Client({
        endpoint: config.s3.url,
        region: config.s3.region,
        credentials: {
          accessKeyId: config.s3.accessKeyId,
          secretAccessKey: config.s3.secretAccessKey,
        },
        forcePathStyle: true, // Necessário para Minio
      });

      this.logger.log('Serviço S3 configurado com sucesso');
    } catch (error) {
      this.logger.error(
        {
          endpoint: config.s3.url,
          region: config.s3.region,
          bucket: this.bucket,
          error: error instanceof Error ? error.message : String(error),
        },
        'Erro ao configurar cliente S3',
      );
    }
  }

  /**
   * Faz upload de um arquivo para o S3/Minio
   * @param arquivo Buffer do arquivo
   * @param nomeOriginal Nome original do arquivo
   * @param pasta Pasta onde salvar o arquivo (opcional)
   * @returns Chave do objeto (caminho) no storage
   */
  async fazerUploadArquivo(arquivo: Buffer, nomeOriginal: string, pasta: string = 'uploads'): Promise<string> {
    if (!this.client) {
      this.logger.warn('Não é possível fazer upload: S3 não configurado');
      throw new Error('Serviço de storage não configurado');
    }

    try {
      // Gerar nome único para o arquivo
      const extensaoArquivo = path.extname(nomeOriginal);
      const nomeArquivo = `${randomUUID()}${extensaoArquivo}`;
      const chave = `${pasta}/${nomeArquivo}`;

      // Detectar tipo MIME baseado na extensão
      const tipoMime = this.obterTipoMime(extensaoArquivo);

      this.logger.debug(
        {
          nomeOriginal,
          nomeArquivo,
          chave,
          tipoMime,
          tamanhoArquivo: arquivo.length,
          pasta,
        },
        'Iniciando upload de arquivo',
      );

      const comando = new PutObjectCommand({
        Bucket: this.bucket,
        Key: chave,
        Body: arquivo,
        ContentType: tipoMime,
        // Tornar o arquivo público para leitura
        ACL: 'public-read',
      });

      await this.client.send(comando);

      this.logger.log(
        {
          nomeOriginal,
          chave,
          tamanhoArquivo: arquivo.length,
        },
        'Upload de arquivo concluído com sucesso',
      );

      // Retornar apenas a chave do objeto
      return chave;
    } catch (error) {
      this.logger.error(
        {
          nomeOriginal,
          pasta,
          error: error instanceof Error ? error.message : String(error),
        },
        'Erro ao fazer upload do arquivo',
      );
      throw new Error('Falha no upload do arquivo');
    }
  }

  /**
   * Baixa um arquivo do S3/Minio
   * @param chave Chave do arquivo no bucket
   * @returns Buffer do arquivo
   */
  async baixarArquivo(chave: string): Promise<Buffer> {
    if (!this.client) {
      this.logger.warn('Não é possível baixar arquivo: S3 não configurado');
      throw new Error('Serviço de storage não configurado');
    }

    try {
      this.logger.debug(
        {
          chave,
          bucket: this.bucket,
        },
        'Iniciando download de arquivo',
      );

      const comando = new GetObjectCommand({
        Bucket: this.bucket,
        Key: chave,
      });

      const resposta = await this.client.send(comando);

      if (!resposta.Body) {
        this.logger.warn(
          {
            chave,
            bucket: this.bucket,
          },
          'Arquivo não encontrado',
        );
        throw new Error('Arquivo não encontrado');
      }

      // Converter o stream para buffer
      const chunks: Uint8Array[] = [];
      const stream = resposta.Body as NodeJS.ReadableStream;

      for await (const chunk of stream) {
        chunks.push(chunk as Uint8Array);
      }

      const buffer = Buffer.concat(chunks);

      this.logger.log(
        {
          chave,
          tamanhoArquivo: buffer.length,
        },
        'Download de arquivo concluído com sucesso',
      );

      return buffer;
    } catch (error) {
      this.logger.error(
        {
          chave,
          bucket: this.bucket,
          error: error instanceof Error ? error.message : String(error),
        },
        'Erro ao baixar arquivo',
      );
      throw new Error('Falha ao baixar arquivo');
    }
  }

  /**
   * Remove um arquivo do S3/Minio
   * @param urlArquivo URL completa do arquivo
   */
  async deletarArquivo(urlArquivo: string): Promise<void> {
    if (!this.client) {
      this.logger.warn('Não é possível deletar arquivo: S3 não configurado');
      throw new Error('Serviço de storage não configurado');
    }

    try {
      // Extrair a chave do arquivo da URL
      const url = new URL(urlArquivo);
      const chave = url.pathname.substring(1).replace(`${this.bucket}/`, '');

      this.logger.debug(
        {
          urlArquivo,
          chave,
          bucket: this.bucket,
        },
        'Iniciando exclusão de arquivo',
      );

      const comando = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: chave,
      });

      await this.client.send(comando);

      this.logger.log(
        {
          urlArquivo,
          chave,
        },
        'Arquivo deletado com sucesso',
      );
    } catch (error) {
      this.logger.error(
        {
          urlArquivo,
          error: error instanceof Error ? error.message : String(error),
        },
        'Erro ao deletar arquivo',
      );
      throw new Error('Falha ao deletar arquivo');
    }
  }

  /**
   * Determina o tipo MIME baseado na extensão do arquivo
   */
  private obterTipoMime(extensao: string): string {
    const tiposMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
    };

    return tiposMime[extensao.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Gera URL pública para um arquivo
   * @param chave Chave do objeto no storage
   * @returns URL pública do arquivo
   */
  obterUrlPublica(chave: string): string {
    return `${config.s3.url}/${this.bucket}/${chave}`;
  }

  /**
   * Verifica se o serviço S3 está configurado e disponível
   */
  isConfigurado(): boolean {
    return this.client !== null;
  }
}
