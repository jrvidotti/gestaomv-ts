import z from "zod";

// ============ SCHEMAS DE MATERIAIS ============

export const formMaterialSchema = z.object({
	nome: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(100, "Nome deve ter no máximo 100 caracteres"),
	descricao: z.string().optional(),
	tipoMaterialId: z.string(),
	valorUnitario: z
		.number()
		.min(0, "Valor unitário deve ser maior ou igual a zero"),
	foto: z.string().optional().or(z.literal("")),
	unidadeMedidaId: z
		.string()
		.min(1, "Unidade de medida é obrigatória")
		.default("UN"),
	ativo: z.boolean().optional(),
});

export const filtroMateriaisSchema = z.object({
	busca: z.string().optional(),
	tipoMaterialId: z.string().optional(),
	ativo: z.boolean().optional(),
	pagina: z.number().min(1, "Página deve ser maior que 0").default(1),
	limite: z
		.number()
		.min(1, "Limite deve ser maior que 0")
		.max(100, "Limite máximo é 100")
		.default(20),
});

// Schema para formulário de criar material (com transformações)
export const formCriarMaterialSchema = z.object({
	nome: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(100, "Nome deve ter no máximo 100 caracteres")
		.transform((val) => val.trim()),
	descricao: z
		.string()
		.transform((val) => val.trim())
		.optional(),
	tipoMaterialId: z.string(),
	valorUnitario: z
		.string()
		.min(1, "Valor é obrigatório")
		.transform((val) => {
			const num = Number.parseFloat(val.replace(",", "."));
			if (Number.isNaN(num) || num < 0) {
				throw new Error(
					"Valor deve ser um número válido maior ou igual a zero",
				);
			}
			return num;
		}),
	foto: z.string().optional(),
	unidadeMedidaId: z
		.string()
		.min(1, "Unidade de medida é obrigatória")
		.default("UN")
		.transform((val) => val.trim()),
});

// ============ TIPOS DERIVADOS ============

export type CriarMaterialData = z.infer<typeof formMaterialSchema>;
export type AtualizarMaterialData = z.infer<typeof atualizarMaterialSchema>;
export type FiltrosMateriais = z.infer<typeof filtroMateriaisSchema>;

export type FormCriarMaterialData = z.infer<typeof formCriarMaterialSchema>;
