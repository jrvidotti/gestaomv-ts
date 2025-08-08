import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { STATUS_DOCUMENTO, TIPO_LANCAMENTO, TIPO_OCORRENCIA } from "../enums";
import { NotFoundError } from "../errors";
import { documentos, lancamentos, ocorrencias } from "../schemas";

export class OcorrenciasService {
	async listarPorDocumento(documentoId: number) {
		return db.query.ocorrencias.findMany({
			where: eq(ocorrencias.documentoId, documentoId),
			orderBy: [desc(ocorrencias.dataOcorrencia)],
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

	async obterEstatisticasOcorrencias(dataInicio: Date, dataFim: Date) {
		// TODO: Implementar consultas agregadas
		return {
			totalCompensacoes: 0,
			totalDevolucoes: 0,
			totalProtestos: 0,
			totalProrrogacoes: 0,
			valorTotalTarifas: 0,
		};
	}

	private async gerarLancamentoFinanceiro(ocorrencia: any, documento: any) {
		// Implementar lógica de geração de lançamentos conforme regras de negócio
		// das especificações (seção 4.9)
	}
}
