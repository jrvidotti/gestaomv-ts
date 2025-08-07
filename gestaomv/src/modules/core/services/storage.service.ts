import { randomUUID } from "node:crypto";
import * as path from "node:path";
import { env } from "@/env";
import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

export class StorageService {
	private readonly client: S3Client | null = null;
	private readonly bucket: string;

	constructor() {
		this.bucket = env.BUCKET_NAME;

		// Verificar se todas as configurações S3 necessárias estão presentes
		if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
			console.warn(
				"Configurações S3 incompletas. Funcionalidade de storage desabilitada.",
			);
			return;
		}

		try {
			this.client = new S3Client({
				endpoint: env.AWS_ENDPOINT_URL_S3,
				region: env.AWS_REGION,
				credentials: {
					accessKeyId: env.AWS_ACCESS_KEY_ID,
					secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
				},
				forcePathStyle: true, // Necessário para Minio
			});

			console.log("Serviço S3 configurado com sucesso");
		} catch (error) {
			console.error(
				{
					endpoint: env.AWS_ENDPOINT_URL_S3,
					region: env.AWS_REGION,
					bucket: this.bucket,
					error: error instanceof Error ? error.message : String(error),
				},
				"Erro ao configurar cliente S3",
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
	async fazerUploadArquivo(
		arquivo: Buffer,
		nomeOriginal: string,
		pasta = "uploads",
	): Promise<string> {
		if (!this.client) {
			console.warn("Não é possível fazer upload: S3 não configurado");
			throw new Error("Serviço de storage não configurado");
		}

		try {
			// Gerar nome único para o arquivo
			const extensaoArquivo = path.extname(nomeOriginal);
			const nomeArquivo = `${randomUUID()}${extensaoArquivo}`;
			const chave = `${pasta}/${nomeArquivo}`;

			// Detectar tipo MIME baseado na extensão
			const tipoMime = this.obterTipoMime(extensaoArquivo);

			console.debug(
				{
					nomeOriginal,
					nomeArquivo,
					chave,
					tipoMime,
					tamanhoArquivo: arquivo.length,
					pasta,
				},
				"Iniciando upload de arquivo",
			);

			const comando = new PutObjectCommand({
				Bucket: this.bucket,
				Key: chave,
				Body: arquivo,
				ContentType: tipoMime,
				// Tornar o arquivo público para leitura
				ACL: "public-read",
			});

			await this.client.send(comando);

			console.log(
				{
					nomeOriginal,
					chave,
					tamanhoArquivo: arquivo.length,
				},
				"Upload de arquivo concluído com sucesso",
			);

			// Retornar apenas a chave do objeto
			return chave;
		} catch (error) {
			console.error(
				{
					nomeOriginal,
					pasta,
					error: error instanceof Error ? error.message : String(error),
				},
				"Erro ao fazer upload do arquivo",
			);
			throw new Error("Falha no upload do arquivo");
		}
	}

	/**
	 * Baixa um arquivo do S3/Minio
	 * @param chave Chave do arquivo no bucket
	 * @returns Buffer do arquivo
	 */
	async baixarArquivo(chave: string): Promise<Buffer> {
		if (!this.client) {
			console.warn("Não é possível baixar arquivo: S3 não configurado");
			throw new Error("Serviço de storage não configurado");
		}

		try {
			console.debug(
				{
					chave,
					bucket: this.bucket,
				},
				"Iniciando download de arquivo",
			);

			const comando = new GetObjectCommand({
				Bucket: this.bucket,
				Key: chave,
			});

			const resposta = await this.client.send(comando);

			if (!resposta.Body) {
				console.warn(
					{
						chave,
						bucket: this.bucket,
					},
					"Arquivo não encontrado",
				);
				throw new Error("Arquivo não encontrado");
			}

			// Converter o stream para buffer
			const chunks: Uint8Array[] = [];
			const stream = resposta.Body as NodeJS.ReadableStream;

			for await (const chunk of stream) {
				chunks.push(chunk as Uint8Array);
			}

			const buffer = Buffer.concat(chunks);

			console.log(
				{
					chave,
					tamanhoArquivo: buffer.length,
				},
				"Download de arquivo concluído com sucesso",
			);

			return buffer;
		} catch (error) {
			console.error(
				{
					chave,
					bucket: this.bucket,
					error: error instanceof Error ? error.message : String(error),
				},
				"Erro ao baixar arquivo",
			);
			throw new Error("Falha ao baixar arquivo");
		}
	}

	/**
	 * Remove um arquivo do S3/Minio
	 * @param urlArquivo URL completa do arquivo
	 */
	async deletarArquivo(urlArquivo: string): Promise<void> {
		if (!this.client) {
			console.warn("Não é possível deletar arquivo: S3 não configurado");
			throw new Error("Serviço de storage não configurado");
		}

		try {
			// Extrair a chave do arquivo da URL
			const url = new URL(urlArquivo);
			const chave = url.pathname.substring(1).replace(`${this.bucket}/`, "");

			console.debug(
				{
					urlArquivo,
					chave,
					bucket: this.bucket,
				},
				"Iniciando exclusão de arquivo",
			);

			const comando = new DeleteObjectCommand({
				Bucket: this.bucket,
				Key: chave,
			});

			await this.client.send(comando);

			console.log(
				{
					urlArquivo,
					chave,
				},
				"Arquivo deletado com sucesso",
			);
		} catch (error) {
			console.error(
				{
					urlArquivo,
					error: error instanceof Error ? error.message : String(error),
				},
				"Erro ao deletar arquivo",
			);
			throw new Error("Falha ao deletar arquivo");
		}
	}

	/**
	 * Determina o tipo MIME baseado na extensão do arquivo
	 */
	private obterTipoMime(extensao: string): string {
		const tiposMime: Record<string, string> = {
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
			".png": "image/png",
			".gif": "image/gif",
			".webp": "image/webp",
			".svg": "image/svg+xml",
			".pdf": "application/pdf",
			".mp4": "video/mp4",
			".mov": "video/quicktime",
			".avi": "video/x-msvideo",
		};

		return tiposMime[extensao.toLowerCase()] || "application/octet-stream";
	}

	/**
	 * Gera URL pública para um arquivo
	 * @param chave Chave do objeto no storage
	 * @returns URL pública do arquivo
	 */
	obterUrlPublica(chave: string): string {
		return `${env.AWS_ENDPOINT_URL_S3}/${this.bucket}/${chave}`;
	}

	/**
	 * Verifica se o serviço S3 está configurado e disponível
	 */
	isConfigurado(): boolean {
		return this.client !== null;
	}
}
