import { z } from "zod";
import { STATUS_ANEXO_ARRAY, TIPOS_ARQUIVO_ARRAY } from "../enums";

export const ListarAnexosPorClienteInputDto = z.object({
	clienteId: z.number().int().positive(),
});

export const ListarAnexosPorPessoaInputDto = z.object({
	pessoaId: z.number().int().positive(),
});

export const ListarAnexosPorOperacaoInputDto = z.object({
	operacaoId: z.number().int().positive(),
});

export const ListarAnexosPorDocumentoInputDto = z.object({
	documentoId: z.number().int().positive(),
});

export const CriarAnexoInputDto = z
	.object({
		// Apenas um dos campos de entidade deve ser fornecido
		pessoaId: z.number().int().positive().optional(),
		clienteId: z.number().int().positive().optional(),
		operacaoId: z.number().int().positive().optional(),
		documentoId: z.number().int().positive().optional(),

		observacao: z.string().optional(),
		tipoArquivo: z.enum(TIPOS_ARQUIVO_ARRAY),
		chaveArquivoS3: z.string().optional(),
		nomeArquivo: z.string().optional(),
		tamanhoArquivo: z.number().int().positive().optional(),
		tipoMime: z.string().optional(),
	})
	.refine(
		(data) => {
			// Pelo menos um campo de entidade deve estar presente
			const entidadeFields = [
				data.pessoaId,
				data.clienteId,
				data.operacaoId,
				data.documentoId,
			];
			const definedFields = entidadeFields.filter(
				(field) => field !== undefined,
			);
			return definedFields.length === 1;
		},
		{
			message:
				"Exatamente um campo de entidade deve ser fornecido (pessoaId, clienteId, operacaoId, ou documentoId)",
		},
	);

export const UploadAnexoInputDto = z
	.object({
		// Apenas um dos campos de entidade deve ser fornecido
		pessoaId: z.number().int().positive().optional(),
		clienteId: z.number().int().positive().optional(),
		operacaoId: z.number().int().positive().optional(),
		documentoId: z.number().int().positive().optional(),

		observacao: z.string().optional(),
		tipoArquivo: z.enum(TIPOS_ARQUIVO_ARRAY),

		// Dados do arquivo
		arquivo: z.string(), // Base64 ou buffer do arquivo
		nomeArquivo: z.string(),
		tamanhoArquivo: z.number().int().positive(),
		tipoMime: z.string(),
		pastaDestino: z.string().optional().default("anexos-gerais"),
	})
	.refine(
		(data) => {
			// Pelo menos um campo de entidade deve estar presente
			const entidadeFields = [
				data.pessoaId,
				data.clienteId,
				data.operacaoId,
				data.documentoId,
			];
			const definedFields = entidadeFields.filter(
				(field) => field !== undefined,
			);
			return definedFields.length === 1;
		},
		{
			message:
				"Exatamente um campo de entidade deve ser fornecido (pessoaId, clienteId, operacaoId, ou documentoId)",
		},
	);

export const ArquivarAnexoInputDto = z.object({
	id: z.number().int().positive(),
});

export type ListarAnexosPorClienteInput = z.infer<
	typeof ListarAnexosPorClienteInputDto
>;
export type ListarAnexosPorPessoaInput = z.infer<
	typeof ListarAnexosPorPessoaInputDto
>;
export type ListarAnexosPorOperacaoInput = z.infer<
	typeof ListarAnexosPorOperacaoInputDto
>;
export type ListarAnexosPorDocumentoInput = z.infer<
	typeof ListarAnexosPorDocumentoInputDto
>;
export type CriarAnexoInput = z.infer<typeof CriarAnexoInputDto>;
export type UploadAnexoInput = z.infer<typeof UploadAnexoInputDto>;
export type ArquivarAnexoInput = z.infer<typeof ArquivarAnexoInputDto>;
