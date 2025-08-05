import { RouteGuard } from "@/components/auth/route-guard";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/integrations/trpc/react";
import { STATUS_OPTIONS } from "@/modules/almoxarifado/consts";
import type {
	ConsumoAnalitico,
	ConsumoSintetico,
	RelatorioConsumoFiltros,
	TipoRelatorioConsumo,
} from "@/modules/almoxarifado/dtos";
import { USER_ROLES } from "@/modules/core/enums";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Download } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/almoxarifado/relatorios/")({
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const [filtros, setFiltros] = useState<RelatorioConsumoFiltros>({});
	const [tipoRelatorio, setTipoRelatorio] =
		useState<TipoRelatorioConsumo>("sintetico");

	const { data: unidades } = useQuery(trpc.unidades.findAll.queryOptions());

	const { data: tiposMaterial } = useQuery(
		trpc.almoxarifado.materiais.listarTiposMaterial.queryOptions(),
	);

	const { data: consumoSintetico, isLoading: loadingSintetico } = useQuery(
		trpc.almoxarifado.stats.obterConsumoSintetico.queryOptions(filtros),
	);

	const { data: consumoAnalitico, isLoading: loadingAnalitico } = useQuery(
		trpc.almoxarifado.stats.obterConsumoAnalitico.queryOptions(filtros),
	);

	const handleDateRangeChange = (dates: {
		dataInicial?: string;
		dataFinal?: string;
	}) => {
		setFiltros((prev) => ({
			...prev,
			dataInicial: dates.dataInicial ? new Date(dates.dataInicial) : undefined,
			dataFinal: dates.dataFinal ? new Date(dates.dataFinal) : undefined,
		}));
	};

	const handleUnidadeChange = (value: string) => {
		setFiltros((prev) => ({
			...prev,
			unidadeId: value === "all" ? undefined : Number(value),
		}));
	};

	const handleTipoMaterialChange = (value: string) => {
		setFiltros((prev) => ({
			...prev,
			tipoMaterialId: value === "all" ? undefined : value,
		}));
	};

	const handleStatusChange = (value: string) => {
		setFiltros((prev) => ({
			...prev,
			status: value === "all" ? undefined : value,
		}));
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const formatNumber = (value: number) => {
		return new Intl.NumberFormat("pt-BR").format(value);
	};

	const dados =
		tipoRelatorio === "sintetico" ? consumoSintetico : consumoAnalitico;
	const isLoading =
		tipoRelatorio === "sintetico" ? loadingSintetico : loadingAnalitico;

	const valorTotalGeral =
		dados?.reduce((acc, item) => acc + item.valorTotal, 0) || 0;
	const quantidadeTotalGeral =
		dados?.reduce((acc, item) => acc + item.quantidadeTotal, 0) || 0;

	const header = (
		<PageHeader
			title="Relatórios de Consumo"
			subtitle="Análise de consumo de materiais por unidade e tipo"
			actions={[
				<Button key="exportar-excel" variant="outline" size="sm">
					<Download className="h-4 w-4 mr-2" />
					Exportar Excel
				</Button>,
				<Button key="exportar-pdf" variant="outline" size="sm">
					<Download className="h-4 w-4 mr-2" />
					Exportar PDF
				</Button>,
			]}
		/>
	);

	return (
		<RouteGuard
			requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_ALMOXARIFADO]}
		>
			<AdminLayout header={header}>
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="h-5 w-5" />
								Filtros e Configurações
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Período</label>
									<DateRangeFilter
										value={{
											dataInicial: filtros.dataInicial
												?.toISOString()
												.split("T")[0],
											dataFinal: filtros.dataFinal?.toISOString().split("T")[0],
										}}
										onValueChange={handleDateRangeChange}
										placeholder="Selecionar período"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium">Unidade</label>
									<Select
										value={filtros.unidadeId?.toString() || "all"}
										onValueChange={handleUnidadeChange}
									>
										<SelectTrigger className="h-8">
											<SelectValue placeholder="Todas as unidades" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todas as unidades</SelectItem>
											{unidades?.map((unidade) => (
												<SelectItem
													key={unidade.id}
													value={unidade.id.toString()}
												>
													{unidade.nome}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium">
										Tipo de Material
									</label>
									<Select
										value={filtros.tipoMaterialId || "all"}
										onValueChange={handleTipoMaterialChange}
									>
										<SelectTrigger className="h-8">
											<SelectValue placeholder="Todos os tipos" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos os tipos</SelectItem>
											{tiposMaterial?.map((tipo) => (
												<SelectItem key={tipo.id} value={tipo.id}>
													{tipo.nome}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium">Status</label>
									<Select
										value={filtros.status || "all"}
										onValueChange={handleStatusChange}
									>
										<SelectTrigger className="h-8">
											<SelectValue placeholder="Todos os status" />
										</SelectTrigger>
										<SelectContent>
											{STATUS_OPTIONS.map((status) => (
												<SelectItem key={status.value} value={status.value}>
													{status.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium">
										Tipo de Relatório
									</label>
									<Select
										value={tipoRelatorio}
										onValueChange={setTipoRelatorio as (value: string) => void}
									>
										<SelectTrigger className="h-8">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="sintetico">Sintético</SelectItem>
											<SelectItem value="analitico">Analítico</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="h-5 w-5" />
								Resumo Geral
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="bg-blue-50 p-4 rounded-lg">
									<div className="text-sm text-blue-600 font-medium">
										Total de Registros
									</div>
									<div className="text-2xl font-bold text-blue-900">
										{formatNumber(dados?.length || 0)}
									</div>
								</div>
								<div className="bg-green-50 p-4 rounded-lg">
									<div className="text-sm text-green-600 font-medium">
										Quantidade Total
									</div>
									<div className="text-2xl font-bold text-green-900">
										{formatNumber(quantidadeTotalGeral)}
									</div>
								</div>
								<div className="bg-emerald-50 p-4 rounded-lg">
									<div className="text-sm text-emerald-600 font-medium">
										Valor Total
									</div>
									<div className="text-2xl font-bold text-emerald-900">
										{formatCurrency(valorTotalGeral)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>
								Relatório de Consumo -{" "}
								{tipoRelatorio === "sintetico" ? "Sintético" : "Analítico"}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex justify-center items-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
								</div>
							) : (
								<div className="overflow-x-auto">
									{tipoRelatorio === "sintetico" ? (
										<TabelaSintetica
											dados={consumoSintetico || []}
											valorTotalGeral={valorTotalGeral}
										/>
									) : (
										<TabelaAnalitica
											dados={consumoAnalitico || []}
											valorTotalGeral={valorTotalGeral}
										/>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}

function TabelaSintetica({
	dados,
	valorTotalGeral,
}: { dados: ConsumoSintetico[]; valorTotalGeral: number }) {
	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	const formatNumber = (value: number) =>
		new Intl.NumberFormat("pt-BR").format(value);
	const formatPercent = (valor: number, total: number) =>
		`${((valor / total) * 100).toFixed(1)}%`;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Unidade</TableHead>
					<TableHead>Tipo de Material</TableHead>
					<TableHead className="text-right">Quantidade</TableHead>
					<TableHead className="text-right">Valor Total</TableHead>
					<TableHead className="text-right">% do Total</TableHead>
					<TableHead className="text-right">Nº Solicitações</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{dados.map((item) => (
					<TableRow key={`${item.unidadeId}-${item.tipoMaterialId}`}>
						<TableCell className="font-medium">{item.unidadeNome}</TableCell>
						<TableCell>{item.tipoMaterialNome}</TableCell>
						<TableCell className="text-right">
							{formatNumber(item.quantidadeTotal)}
						</TableCell>
						<TableCell className="text-right">
							{formatCurrency(item.valorTotal)}
						</TableCell>
						<TableCell className="text-right">
							{formatPercent(item.valorTotal, valorTotalGeral)}
						</TableCell>
						<TableCell className="text-right">
							{formatNumber(item.numeroSolicitacoes)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function TabelaAnalitica({
	dados,
	valorTotalGeral,
}: { dados: ConsumoAnalitico[]; valorTotalGeral: number }) {
	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	const formatNumber = (value: number) =>
		new Intl.NumberFormat("pt-BR").format(value);
	const formatPercent = (valor: number, total: number) =>
		`${((valor / total) * 100).toFixed(1)}%`;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Unidade</TableHead>
					<TableHead>Tipo de Material</TableHead>
					<TableHead>Material</TableHead>
					<TableHead className="text-right">Quantidade</TableHead>
					<TableHead className="text-right">Valor Unitário</TableHead>
					<TableHead className="text-right">Valor Total</TableHead>
					<TableHead className="text-right">% do Total</TableHead>
					<TableHead className="text-right">Nº Solicitações</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{dados.map((item) => (
					<TableRow
						key={`${item.unidadeId}-${item.tipoMaterialId}-${item.materialId}`}
					>
						<TableCell className="font-medium">{item.unidadeNome}</TableCell>
						<TableCell>{item.tipoMaterialNome}</TableCell>
						<TableCell>{item.materialNome}</TableCell>
						<TableCell className="text-right">
							{formatNumber(item.quantidadeTotal)}
						</TableCell>
						<TableCell className="text-right">
							{formatCurrency(item.valorUnitario)}
						</TableCell>
						<TableCell className="text-right">
							{formatCurrency(item.valorTotal)}
						</TableCell>
						<TableCell className="text-right">
							{formatPercent(item.valorTotal, valorTotalGeral)}
						</TableCell>
						<TableCell className="text-right">
							{formatNumber(item.numeroSolicitacoes)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
