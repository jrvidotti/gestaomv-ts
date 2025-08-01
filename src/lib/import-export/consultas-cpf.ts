import { getDatabase, schema } from "@/db";
import { consultasCpf } from "@/db/schemas";
import type { ImportExportOptions } from ".";

export interface ConsultaCpfImport {
	cpf: string;
	dados: string;
	criadoEm: string | null;
}

export const config = {
	descricaoArquivo: "Dados de consultas CPF para seed",
	buscarItens: async () => {
		return await getDatabase()
			.select({
				cpf: schema.consultasCpf.cpf,
				dados: schema.consultasCpf.dados,
				criadoEm: schema.consultasCpf.criadoEm,
			})
			.from(schema.consultasCpf)
			.orderBy(schema.consultasCpf.criadoEm);
	},
	importarItem: async (consulta) => {
		const result = await getDatabase()
			.insert(consultasCpf)
			.values({
				cpf: consulta.cpf,
				dados: consulta.dados,
				criadoEm: consulta.criadoEm
					? new Date(consulta.criadoEm).toISOString()
					: undefined,
			})
			.onConflictDoNothing();

		return result.changes > 0;
	},
} satisfies ImportExportOptions<ConsultaCpfImport>;
