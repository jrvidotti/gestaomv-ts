import { getDatabase, schema } from "@/db";
import { unidadesMedida } from "@/db/schemas";
import type { ImportExportOptions } from ".";

export interface UnidadeMedidaImport {
	id: string;
	nome: string;
}

export const config = {
	descricaoArquivo: "Dados de unidades de medida para seed",
	buscarItens: async () => {
		return await getDatabase()
			.select({
				id: schema.unidadesMedida.id,
				nome: schema.unidadesMedida.nome,
			})
			.from(schema.unidadesMedida)
			.orderBy(schema.unidadesMedida.nome);
	},
	importarItem: async (unidadeMedida) => {
		const result = await getDatabase()
			.insert(unidadesMedida)
			.values({
				id: unidadeMedida.id,
				nome: unidadeMedida.nome,
			})
			.onConflictDoNothing();

		return result.changes > 0;
	},
} satisfies ImportExportOptions<UnidadeMedidaImport>;
