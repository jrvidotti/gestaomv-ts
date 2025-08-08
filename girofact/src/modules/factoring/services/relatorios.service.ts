import type { Db } from "@/db";
import { endOfDay, format, startOfDay } from "date-fns";
import { and, count, eq, gte, lte, sum } from "drizzle-orm";
import { clientes, documentos, lancamentos, operacoes } from "../schemas";

export class RelatoriosService {
	constructor(private db: Db) {}
	async dashboardExecutivo(dataInicio: Date, dataFim: Date) {
		const periodo = and(
			gte(operacoes.criadoEm, startOfDay(dataInicio).toISOString()),
			lte(operacoes.criadoEm, endOfDay(dataFim).toISOString()),
		);

		// Volume operado
		const volumeOperado = await this.db
			.select({ total: sum(operacoes.valorLiquido) })
			.from(operacoes)
			.where(periodo);

		// Total de operações
		const totalOperacoes = await this.db
			.select({ count: count() })
			.from(operacoes)
			.where(periodo);

		// Clientes ativos (que fizeram operações no período)
		const clientesAtivos = await this.db
			.selectDistinct({ clienteId: operacoes.clienteId })
			.from(operacoes)
			.where(periodo);

		// Taxa de inadimplência (documentos devolvidos vs total)
		const documentosDevolvidos = await this.db
			.select({ count: count() })
			.from(documentos)
			.where(eq(documentos.foiDevolvido, true));

		const totalDocumentos = await this.db
			.select({ count: count() })
			.from(documentos);

		const taxaInadimplencia = totalDocumentos[0]?.count
			? ((documentosDevolvidos[0]?.count || 0) / totalDocumentos[0].count) * 100
			: 0;

		return {
			volumeOperado: volumeOperado[0]?.total || 0,
			totalOperacoes: totalOperacoes[0]?.count || 0,
			clientesAtivos: clientesAtivos.length,
			taxaInadimplencia: Math.round(taxaInadimplencia * 100) / 100,
		};
	}

	async posicaoDocumentos(dataReferencia: Date) {
		const documentosPendentes = await this.db
			.select({
				count: count(),
				valor: sum(documentos.valorDocumento),
			})
			.from(documentos)
			.where(eq(documentos.status, "pendente"));

		const documentosCompensados = await this.db
			.select({
				count: count(),
				valor: sum(documentos.valorDocumento),
			})
			.from(documentos)
			.where(eq(documentos.status, "compensado"));

		const documentosDevolvidos = await this.db
			.select({
				count: count(),
				valor: sum(documentos.valorDocumento),
			})
			.from(documentos)
			.where(eq(documentos.status, "devolvido"));

		return {
			pendentes: {
				quantidade: documentosPendentes[0]?.count || 0,
				valor: documentosPendentes[0]?.valor || 0,
			},
			compensados: {
				quantidade: documentosCompensados[0]?.count || 0,
				valor: documentosCompensados[0]?.valor || 0,
			},
			devolvidos: {
				quantidade: documentosDevolvidos[0]?.count || 0,
				valor: documentosDevolvidos[0]?.valor || 0,
			},
		};
	}

	async carteiraClientes() {
		const clientesAtivos = await this.db
			.select({ count: count() })
			.from(clientes)
			.where(eq(clientes.status, "ativo"));

		const clientesBloqueados = await this.db
			.select({ count: count() })
			.from(clientes)
			.where(eq(clientes.status, "bloqueado"));

		const limiteTotal = await this.db
			.select({ total: sum(clientes.limiteCredito) })
			.from(clientes)
			.where(eq(clientes.creditoAutorizado, true));

		return {
			ativos: clientesAtivos[0]?.count || 0,
			bloqueados: clientesBloqueados[0]?.count || 0,
			limiteTotal: limiteTotal[0]?.total || 0,
		};
	}
}
