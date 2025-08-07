import { db } from "@/db";
import { consultasCpf } from "@/db/schemas";
import type { ImportExportOptions } from "@/lib/import-export";

export interface ConsultaCpfImport {
  cpf: string;
  dados: string;
  criadoEm: string | null;
}

export const config = {
  nomeArquivo: "consultas-cpf",
  descricaoArquivo: "Dados de consultas CPF para seed",
  buscarItens: async () => {
    return await db
      .select({
        cpf: consultasCpf.cpf,
        dados: consultasCpf.dados,
        criadoEm: consultasCpf.criadoEm,
      })
      .from(consultasCpf)
      .orderBy(consultasCpf.criadoEm);
  },
  importarItem: async (consulta) => {
    const result = await db
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
