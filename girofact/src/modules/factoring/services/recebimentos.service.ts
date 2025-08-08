import type { Db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { TIPO_LANCAMENTO } from "../enums";
import { lancamentos, recebimentos } from "../schemas";

export class RecebimentosService {
	constructor(private db: Db) {}
	async criar(data: any, userId: number) {
		try {
			return await this.db.transaction(async (tx) => {
				// Criar recebimento
				const [recebimento] = await tx
					.insert(recebimentos)
					.values({
						...data,
						userId,
					})
					.returning();

				// Gerar lançamento automático
				await tx.insert(lancamentos).values({
					clienteId: data.clienteId,
					dataLancamento: data.dataRecebimento.toISOString(),
					valorLancamento: data.valorRecebimento,
					tipoLancamento: TIPO_LANCAMENTO.ENTRADA,
					origemLancamento: "recebimento_manual",
					carteiraId: data.carteiraId,
					observacao: `Recebimento manual - ${data.observacao || ""}`.trim(),
					userId,
				});

				return recebimento;
			});
		} catch (error) {
			throw new Error(
				`Erro ao criar recebimento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		}
	}

	async listarPorCliente(clienteId: number) {
		return this.db.query.recebimentos.findMany({
			where: eq(recebimentos.clienteId, clienteId),
			orderBy: [desc(recebimentos.dataRecebimento)],
			with: {
				carteira: {
					columns: { nome: true },
				},
				user: {
					columns: { name: true },
				},
			},
		});
	}
}
