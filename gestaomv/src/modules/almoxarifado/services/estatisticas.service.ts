import { db } from "@/db";
import {
	materiais,
	solicitacoesMaterial,
	solicitacoesMaterialItens,
	unidades,
} from "@/db/schemas";
import type { TopMaterialResult } from "@/modules/almoxarifado/types";
import { and, count, desc, eq, sql } from "drizzle-orm";

export class EstatisticasService {
	async obterEstatisticas(
		dataInicial?: Date,
		dataFinal?: Date,
		status?: string,
	) {
		const condicoes: ReturnType<typeof sql>[] = [];
		if (dataInicial) {
			condicoes.push(
				sql`${solicitacoesMaterial.dataOperacao} >= ${dataInicial.toISOString()}`,
			);
		}
		if (dataFinal) {
			condicoes.push(
				sql`${solicitacoesMaterial.dataOperacao} <= ${dataFinal.toISOString()}`,
			);
		}
		if (status && status !== "all") {
			condicoes.push(sql`${solicitacoesMaterial.status} = ${status}`);
		}
		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const [{ totalSolicitacoes }] = await db
			.select({ totalSolicitacoes: count() })
			.from(solicitacoesMaterial)
			.where(whereClause);

		const [{ materiaisAtivos }] = await db
			.select({ materiaisAtivos: count() })
			.from(materiais)
			.where(eq(materiais.ativo, true));

		const [{ unidadesAtivas }] = await db
			.select({
				unidadesAtivas: sql<number>`COUNT(DISTINCT ${solicitacoesMaterial.unidadeId})`,
			})
			.from(solicitacoesMaterial)
			.where(whereClause);

		const valorTotal = await db
			.select({
				total: sql<number>`SUM(${solicitacoesMaterialItens.qtdSolicitada} * ${materiais.valorUnitario})`,
			})
			.from(solicitacoesMaterialItens)
			.innerJoin(
				materiais,
				eq(solicitacoesMaterialItens.materialId, materiais.id),
			)
			.innerJoin(
				solicitacoesMaterial,
				eq(
					solicitacoesMaterialItens.solicitacaoMaterialId,
					solicitacoesMaterial.id,
				),
			)
			.where(whereClause);

		const solicitacoesPorStatus = await db
			.select({
				status: solicitacoesMaterial.status,
				total: count(),
			})
			.from(solicitacoesMaterial)
			.where(whereClause)
			.groupBy(solicitacoesMaterial.status);

		const statusMap = {
			pendente: 0,
			aprovada: 0,
			rejeitada: 0,
			atendida: 0,
		};

		for (const item of solicitacoesPorStatus) {
			const status = item.status.toLowerCase() as keyof typeof statusMap;
			statusMap[status] = Number(item.total);
		}

		return {
			totalSolicitacoes: Number(totalSolicitacoes),
			materiaisAtivos: Number(materiaisAtivos),
			unidadesAtivas: Number(unidadesAtivas),
			valorTotalSolicitado: Number(valorTotal[0]?.total || 0),
			solicitacoesPorStatus: statusMap,
		};
	}

	async obterTopMateriais(
		limite = 10,
		dataInicial?: Date,
		dataFinal?: Date,
		status?: string,
	) {
		const condicoes = [
			dataInicial
				? sql`${solicitacoesMaterial.dataOperacao} >= ${dataInicial.toISOString()}`
				: undefined,
			dataFinal
				? sql`${solicitacoesMaterial.dataOperacao} <= ${dataFinal.toISOString()}`
				: undefined,
			status && status !== "all"
				? sql`${solicitacoesMaterial.status} = ${status}`
				: undefined,
		].filter(Boolean);
		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const topMateriais: TopMaterialResult[] = await db
			.select({
				materialId: materiais.id,
				materialNome: materiais.nome,
				materialTipo: materiais.tipoMaterialId,
				valorUnitario: materiais.valorUnitario,
				totalSolicitado: sql<number>`SUM(${solicitacoesMaterialItens.qtdSolicitada})`,
				totalAtendido: sql<number>`SUM(COALESCE(${solicitacoesMaterialItens.qtdAtendida}, 0))`,
				valorTotal: sql<number>`SUM(${solicitacoesMaterialItens.qtdSolicitada} * ${materiais.valorUnitario})`,
				numeroSolicitacoes: sql<number>`COUNT(DISTINCT ${solicitacoesMaterial.id})`,
			})
			.from(solicitacoesMaterialItens)
			.innerJoin(
				materiais,
				eq(solicitacoesMaterialItens.materialId, materiais.id),
			)
			.innerJoin(
				solicitacoesMaterial,
				eq(
					solicitacoesMaterialItens.solicitacaoMaterialId,
					solicitacoesMaterial.id,
				),
			)
			.where(whereClause)
			.groupBy(
				materiais.id,
				materiais.nome,
				materiais.tipoMaterialId,
				materiais.valorUnitario,
			)
			.orderBy(desc(sql`SUM(${solicitacoesMaterialItens.qtdSolicitada})`))
			.limit(limite);

		return topMateriais.map((item) => ({
			...item,
			totalSolicitado: Number(item.totalSolicitado),
			totalAtendido: Number(item.totalAtendido),
			valorTotal: Number(item.valorTotal),
			numeroSolicitacoes: Number(item.numeroSolicitacoes),
		}));
	}

	async obterUsoPorTipo(dataInicial?: Date, dataFinal?: Date, status?: string) {
		const condicoes = [
			dataInicial
				? sql`${solicitacoesMaterial.dataOperacao} >= ${dataInicial.toISOString()}`
				: undefined,
			dataFinal
				? sql`${solicitacoesMaterial.dataOperacao} <= ${dataFinal.toISOString()}`
				: undefined,
			status && status !== "all"
				? sql`${solicitacoesMaterial.status} = ${status}`
				: undefined,
		].filter(Boolean);
		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const usoPorTipo = await db
			.select({
				tipo: materiais.tipoMaterialId,
				totalSolicitado: sql<number>`SUM(${solicitacoesMaterialItens.qtdSolicitada})`,
				totalAtendido: sql<number>`SUM(COALESCE(${solicitacoesMaterialItens.qtdAtendida}, 0))`,
				valorTotal: sql<number>`SUM(${solicitacoesMaterialItens.qtdSolicitada} * ${materiais.valorUnitario})`,
				numeroSolicitacoes: sql<number>`COUNT(DISTINCT ${solicitacoesMaterial.id})`,
			})
			.from(solicitacoesMaterialItens)
			.innerJoin(
				materiais,
				eq(solicitacoesMaterialItens.materialId, materiais.id),
			)
			.innerJoin(
				solicitacoesMaterial,
				eq(
					solicitacoesMaterialItens.solicitacaoMaterialId,
					solicitacoesMaterial.id,
				),
			)
			.where(whereClause)
			.groupBy(materiais.tipoMaterialId)
			.orderBy(desc(sql`SUM(${solicitacoesMaterialItens.qtdSolicitada})`));

		return usoPorTipo.map((item) => ({
			...item,
			totalSolicitado: Number(item.totalSolicitado),
			totalAtendido: Number(item.totalAtendido),
			valorTotal: Number(item.valorTotal),
			numeroSolicitacoes: Number(item.numeroSolicitacoes),
		}));
	}

	async obterUsoPorUnidade(
		dataInicial?: Date,
		dataFinal?: Date,
		status?: string,
	) {
		const condicoes = [
			dataInicial
				? sql`${solicitacoesMaterial.dataOperacao} >= ${dataInicial.toISOString()}`
				: undefined,
			dataFinal
				? sql`${solicitacoesMaterial.dataOperacao} <= ${dataFinal.toISOString()}`
				: undefined,
			status && status !== "all"
				? sql`${solicitacoesMaterial.status} = ${status}`
				: undefined,
		].filter(Boolean);
		const whereClause = condicoes.length > 0 ? and(...condicoes) : undefined;

		const usoPorUnidade = await db
			.select({
				unidadeId: unidades.id,
				unidadeNome: unidades.nome,
				totalSolicitado: sql<number>`SUM(${solicitacoesMaterialItens.qtdSolicitada})`,
				totalAtendido: sql<number>`SUM(COALESCE(${solicitacoesMaterialItens.qtdAtendida}, 0))`,
				valorTotal: sql<number>`SUM(${solicitacoesMaterialItens.qtdSolicitada} * ${materiais.valorUnitario})`,
				numeroSolicitacoes: sql<number>`COUNT(DISTINCT ${solicitacoesMaterial.id})`,
			})
			.from(solicitacoesMaterialItens)
			.innerJoin(
				materiais,
				eq(solicitacoesMaterialItens.materialId, materiais.id),
			)
			.innerJoin(
				solicitacoesMaterial,
				eq(
					solicitacoesMaterialItens.solicitacaoMaterialId,
					solicitacoesMaterial.id,
				),
			)
			.innerJoin(unidades, eq(solicitacoesMaterial.unidadeId, unidades.id))
			.where(whereClause)
			.groupBy(unidades.id, unidades.nome)
			.orderBy(desc(sql`SUM(${solicitacoesMaterialItens.qtdSolicitada})`));

		return usoPorUnidade.map((item) => ({
			...item,
			totalSolicitado: Number(item.totalSolicitado),
			totalAtendido: Number(item.totalAtendido),
			valorTotal: Number(item.valorTotal),
			numeroSolicitacoes: Number(item.numeroSolicitacoes),
		}));
	}
}
