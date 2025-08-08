import { cnpjRegex, cpfRegex, validarCnpj, validarCpf } from "@/lib/cpfCnpj";
import { z } from "zod";
import { TIPOS_PESSOA_ARRAY } from "../enums";

// Schema para endereco
const enderecoSchema = z.object({
	cep: z
		.string()
		.regex(/^\d{5}-?\d{3}$/, "CEP deve ter 8 dígitos")
		.optional()
		.or(z.literal("").transform(() => undefined)),
	logradouro: z.string().optional(),
	numero: z.string().optional(),
	complemento: z.string().optional(),
	bairro: z.string().optional(),
	cidade: z.string().optional(),
	estado: z
		.string()
		.length(2, "Estado deve ter 2 caracteres")
		.optional()
		.or(z.literal("").transform(() => undefined)),
});

// Schema para telefone
export const telefoneSchema = z.object({
	numero: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
	principal: z.boolean().default(false),
	whatsapp: z.boolean().default(false),
	inativo: z.boolean().default(false),
});

// Schema para dados bancários
export const dadosBancariosSchema = z.object({
	banco: z.string().min(3, "Código do banco é obrigatório"),
	agencia: z.string().min(3, "Agência é obrigatória"),
	conta: z.string().min(1, "Conta é obrigatória"),
	digitoVerificador: z.string().min(1, "Dígito verificador é obrigatório"),
	tipoConta: z.enum(["corrente", "poupanca"]).default("corrente"),
});

// Schema principal para pessoa
export const createPessoaSchema = z
	.object({
		tipoPessoa: z.enum(TIPOS_PESSOA_ARRAY),
		documento: z.string().min(11, "Documento é obrigatório"),
		nomeRazaoSocial: z.string().min(2, "Nome/Razão social é obrigatório"),
		nomeFantasia: z.string().optional(),
		dataNascimentoFundacao: z.date().optional(),
		inscricaoEstadual: z.string().optional(),
		inscricaoMunicipal: z.string().optional(),
		nomeMae: z.string().optional(),
		sexo: z.enum(["masculino", "feminino"]).optional(),
		email: z
			.string()
			.email("E-mail inválido")
			.optional()
			.or(z.literal("").transform(() => undefined)),
		...enderecoSchema.shape,
		observacoesGerais: z.string().optional(),
		telefones: z
			.array(telefoneSchema)
			.min(1, "Pelo menos um telefone é obrigatório"),
		dadosBancarios: z.array(dadosBancariosSchema).default([]),
	})
	.superRefine((data, ctx) => {
		// Validar documento baseado no tipo de pessoa
		if (data.tipoPessoa === "fisica") {
			if (!cpfRegex.test(data.documento)) {
				ctx.addIssue({
					code: "custom",
					message: "CPF deve ter formato válido",
					path: ["documento"],
				});
			} else if (!validarCpf(data.documento)) {
				ctx.addIssue({
					code: "custom",
					message: "CPF inválido",
					path: ["documento"],
				});
			}
		} else if (data.tipoPessoa === "juridica") {
			if (!cnpjRegex.test(data.documento)) {
				ctx.addIssue({
					code: "custom",
					message: "CNPJ deve ter formato válido",
					path: ["documento"],
				});
			} else if (!validarCnpj(data.documento)) {
				ctx.addIssue({
					code: "custom",
					message: "CNPJ inválido",
					path: ["documento"],
				});
			}
		}

		// Validar se há pelo menos um telefone principal
		const telefonePrincipal = data.telefones.filter((t) => t.principal).length;
		if (telefonePrincipal > 1) {
			ctx.addIssue({
				code: "custom",
				message: "Deve haver apenas um telefone principal",
				path: ["telefones"],
			});
		}
	});

export const updatePessoaSchema = createPessoaSchema.partial().extend({
	id: z.number().positive(),
	dataNascimentoFundacao: z.union([z.date(), z.string()]).optional(),
});

export const findPessoaSchema = z.object({
	id: z.number().positive(),
});

export const listPessoasSchema = z.object({
	page: z.number().positive().default(1),
	limit: z.number().min(1).max(100).default(20),
	search: z.string().optional(),
	tipoPessoa: z.enum(TIPOS_PESSOA_ARRAY).optional(),
});

// Tipos
export type CreatePessoaDto = z.infer<typeof createPessoaSchema>;
export type UpdatePessoaDto = z.infer<typeof updatePessoaSchema>;
export type FindPessoaDto = z.infer<typeof findPessoaSchema>;
export type ListPessoasDto = z.infer<typeof listPessoasSchema>;
export type TelefoneDto = z.infer<typeof telefoneSchema>;
export type DadosBancariosDto = z.infer<typeof dadosBancariosSchema>;
