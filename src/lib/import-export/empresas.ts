import { getDatabase, schema } from "@/db";
import { empresas } from "@/db/schemas";
import type { ImportExportOptions } from ".";

export interface EmpresaImport {
	razaoSocial: string;
	nomeFantasia: string | null;
	cnpj: string;
	pontowebId: number | null;
}

export const config = {
	descricaoArquivo: "Dados de empresas para seed",
	buscarItens: async () => {
		return await getDatabase()
			.select({
				razaoSocial: schema.empresas.razaoSocial,
				nomeFantasia: schema.empresas.nomeFantasia,
				cnpj: schema.empresas.cnpj,
				pontowebId: schema.empresas.pontowebId,
			})
			.from(schema.empresas)
			.orderBy(schema.empresas.cnpj);
	},
	importarItem: async (empresa) => {
		const result = await getDatabase()
			.insert(empresas)
			.values({
				razaoSocial: empresa.razaoSocial,
				nomeFantasia: empresa.nomeFantasia,
				cnpj: empresa.cnpj,
				pontowebId: empresa.pontowebId,
			})
			.onConflictDoNothing();

		return result.changes > 0;
	},
} satisfies ImportExportOptions<EmpresaImport>;
