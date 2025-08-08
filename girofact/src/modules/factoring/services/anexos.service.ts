import { db } from "@/db";
import { storageService } from "@/modules/core/services";
import { and, desc, eq } from "drizzle-orm";
import type { UploadAnexoInput } from "../dtos/anexos.dto";
import { NotFoundError } from "../errors";
import { anexos } from "../schemas";

export class AnexosService {
	async criar(data: any, userId: number) {
		try {
			const [anexo] = await db
				.insert(anexos)
				.values({
					...data,
					userId,
				})
				.returning();

			return anexo;
		} catch (error) {
			throw new Error(
				`Erro ao criar anexo: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async listarPorCliente(clienteId: number) {
		return db.query.anexos.findMany({
			where: and(eq(anexos.clienteId, clienteId), eq(anexos.status, "ativo")),
			orderBy: [desc(anexos.criadoEm)],
			with: {
				user: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	async listarPorPessoa(pessoaId: number) {
		return db.query.anexos.findMany({
			where: and(eq(anexos.pessoaId, pessoaId), eq(anexos.status, "ativo")),
			orderBy: [desc(anexos.criadoEm)],
			with: {
				user: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	async listarPorOperacao(operacaoId: number) {
		return db.query.anexos.findMany({
			where: and(eq(anexos.operacaoId, operacaoId), eq(anexos.status, "ativo")),
			orderBy: [desc(anexos.criadoEm)],
			with: {
				user: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	async listarPorDocumento(documentoId: number) {
		return db.query.anexos.findMany({
			where: and(
				eq(anexos.documentoId, documentoId),
				eq(anexos.status, "ativo"),
			),
			orderBy: [desc(anexos.criadoEm)],
			with: {
				user: {
					columns: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	async upload(data: UploadAnexoInput, userId: number) {
		try {
			// Converter base64 para buffer
			const buffer = Buffer.from(data.arquivo, "base64");

			// Fazer upload para S3
			const chaveArquivo = await storageService.fazerUploadArquivo(
				buffer,
				data.nomeArquivo,
				data.pastaDestino,
			);

			// Criar registro no banco de dados
			const [anexo] = await db
				.insert(anexos)
				.values({
					pessoaId: data.pessoaId,
					clienteId: data.clienteId,
					operacaoId: data.operacaoId,
					documentoId: data.documentoId,
					observacao: data.observacao,
					tipoArquivo: data.tipoArquivo,
					chaveArquivoS3: chaveArquivo,
					nomeArquivo: data.nomeArquivo,
					tamanhoArquivo: data.tamanhoArquivo,
					tipoMime: data.tipoMime,
					userId,
					status: "ativo",
				})
				.returning();

			return anexo;
		} catch (error) {
			throw new Error(
				`Erro ao fazer upload do anexo: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async arquivar(id: number) {
		const anexo = await db.query.anexos.findFirst({
			where: eq(anexos.id, id),
		});

		if (!anexo) {
			throw new NotFoundError("Anexo não encontrado");
		}

		const [updated] = await db
			.update(anexos)
			.set({
				status: "arquivado",
				atualizadoEm: new Date().toISOString(),
			})
			.where(eq(anexos.id, id))
			.returning();

		return updated;
	}
}
