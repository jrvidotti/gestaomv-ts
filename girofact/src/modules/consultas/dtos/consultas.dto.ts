import { z } from "zod";

// DTO para consulta CPF
export const consultarCpfSchema = z.object({
	documento: z
		.string()
		.min(11, "CPF deve ter 11 dígitos")
		.max(14, "CPF inválido")
		.regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF deve ter formato válido"),
});

export type ConsultarCpfDto = z.infer<typeof consultarCpfSchema>;

// DTO para consulta CEP
export const consultarCepSchema = z.object({
	cep: z
		.string()
		.min(8, "CEP deve ter 8 dígitos")
		.max(9, "CEP inválido")
		.regex(/^\d{5}-?\d{3}$/, "CEP deve ter formato válido (00000-000)"),
});

export type ConsultarCepDto = z.infer<typeof consultarCepSchema>;

// DTO de resposta para consulta CPF
export const consultaCpfResponseSchema = z.object({
	fonte: z.enum(["cache", "api_direct_data", "nao_encontrado", "erro"]),
	dados: z
		.object({
			tipoPessoa: z.literal("fisica"),
			documento: z.string(),
			nomeRazaoSocial: z.string(),
			nomeMae: z.string().optional(),
			dataNascimentoFundacao: z.date().optional(),
			sexo: z.enum(["masculino", "feminino", "nao_informado"]),
			email: z.string().optional(),
			cep: z.string().optional(),
			logradouro: z.string().optional(),
			numero: z.string().optional(),
			complemento: z.string().optional(),
			bairro: z.string().optional(),
			cidade: z.string().optional(),
			estado: z.string().optional(),
			telefones: z
				.array(
					z.object({
						numero: z.string(),
						tipo: z.enum(["celular", "fixo"]),
						principal: z.boolean(),
						inativo: z.boolean(),
						whatsapp: z.boolean(),
						observacoes: z.string().optional(),
					}),
				)
				.optional(),
		})
		.nullable(),
	metadados: z
		.object({
			rendaEstimada: z.string().optional(),
			rendaFaixaSalarial: z.string().optional(),
			idade: z.number().optional(),
			signo: z.string().optional(),
		})
		.optional(),
	criadoEm: z.string().optional(),
	erro: z.string().optional(),
	mensagem: z.string().optional(),
});

export type ConsultaCpfResponseDto = z.infer<typeof consultaCpfResponseSchema>;

// DTO de resposta para consulta CEP
export const consultaCepResponseSchema = z.object({
	fonte: z.enum(["viacep", "nao_encontrado", "erro"]),
	dados: z
		.object({
			cep: z.string(),
			logradouro: z.string(),
			complemento: z.string(),
			bairro: z.string(),
			cidade: z.string(),
			estado: z.string(),
			ibge: z.string().optional(),
			ddd: z.string().optional(),
		})
		.nullable(),
	erro: z.string().optional(),
	mensagem: z.string().optional(),
});

export type ConsultaCepResponseDto = z.infer<typeof consultaCepResponseSchema>;
