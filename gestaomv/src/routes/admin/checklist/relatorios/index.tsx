import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	BarChart,
	Calendar,
	Download,
	FileText,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/checklist/relatorios/")({
	component: RelatoriosPage,
});

function RelatoriosPage() {
	const trpc = useTRPC();

	const header = (
		<PageHeader
			title="Relatórios de Checklist"
			subtitle="Analise dados e compare performance entre unidades e períodos"
		/>
	);

	const [filtrosRelatorio, setFiltrosRelatorio] = useState({
		dataInicio: "",
		dataFim: "",
		agruparPor: "unidade" as "template" | "unidade" | "avaliador" | "mes",
	});

	const [filtrosComparativo, setFiltrosComparativo] = useState({
		dataInicio: "",
		dataFim: "",
	});

	// Query para relatório de avaliações
	const {
		data: relatorioData,
		isLoading: loadingRelatorio,
		refetch: refetchRelatorio,
	} = useQuery({
		...trpc.checklist.avaliacoes.gerarRelatorio.queryOptions(filtrosRelatorio),
		enabled: false, // Só executa quando chamado manualmente
	});

	// Query para comparativo de unidades
	const {
		data: comparativoData,
		isLoading: loadingComparativo,
		refetch: refetchComparativo,
	} = useQuery({
		...trpc.checklist.avaliacoes.gerarComparativo.queryOptions(
			filtrosComparativo,
		),
		enabled: false, // Só executa quando chamado manualmente
	});

	const gerarRelatorio = () => {
		refetchRelatorio();
	};

	const gerarComparativo = () => {
		refetchComparativo();
	};

	const getClassificacaoBadgeVariant = (classificacao: string) => {
		switch (classificacao) {
			case "excelente":
				return "default";
			case "bom":
				return "secondary";
			case "regular":
				return "outline";
			case "ruim":
				return "destructive";
			case "pessimo":
				return "destructive";
			default:
				return "outline";
		}
	};

	const getTendenciaIcon = (tendencia: string) => {
		switch (tendencia) {
			case "melhorou":
				return "📈";
			case "piorou":
				return "📉";
			case "manteve":
				return "➡️";
			default:
				return "🆕";
		}
	};

	return (
		<AdminLayout header={header}>
			<div className="space-y-6">

			{/* Cards de Estatísticas Rápidas */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total de Avaliações
						</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground">Todas as avaliações</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Média Geral</CardTitle>
						<BarChart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground">Todas as unidades</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Este Mês</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground">
							Avaliações concluídas
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tendência</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground">vs mês anterior</p>
					</CardContent>
				</Card>
			</div>

			{/* Relatório de Avaliações */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Relatório de Avaliações
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-4 items-end">
						<div>
							<label className="text-sm font-medium mb-2 block">
								Data Início
							</label>
							<Input
								type="date"
								value={filtrosRelatorio.dataInicio}
								onChange={(e) =>
									setFiltrosRelatorio((prev) => ({
										...prev,
										dataInicio: e.target.value,
									}))
								}
							/>
						</div>
						<div>
							<label className="text-sm font-medium mb-2 block">Data Fim</label>
							<Input
								type="date"
								value={filtrosRelatorio.dataFim}
								onChange={(e) =>
									setFiltrosRelatorio((prev) => ({
										...prev,
										dataFim: e.target.value,
									}))
								}
							/>
						</div>
						<div>
							<label className="text-sm font-medium mb-2 block">
								Agrupar Por
							</label>
							<Select
								value={filtrosRelatorio.agruparPor}
								onValueChange={(value: any) =>
									setFiltrosRelatorio((prev) => ({
										...prev,
										agruparPor: value,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecionar agrupamento" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="unidade">Unidade</SelectItem>
									<SelectItem value="template">Template</SelectItem>
									<SelectItem value="avaliador">Avaliador</SelectItem>
									<SelectItem value="mes">Mês</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button onClick={gerarRelatorio} disabled={loadingRelatorio}>
							{loadingRelatorio ? "Gerando..." : "Gerar Relatório"}
						</Button>
					</div>

					{relatorioData && relatorioData.length > 0 && (
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-semibold">
									Resultado ({relatorioData.length} registros)
								</h3>
								<Button variant="outline" size="sm">
									<Download className="w-4 h-4 mr-2" />
									Exportar
								</Button>
							</div>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Avaliação</TableHead>
										<TableHead>Template</TableHead>
										<TableHead>Unidade</TableHead>
										<TableHead>Avaliador</TableHead>
										<TableHead>Data</TableHead>
										<TableHead>Nota Final</TableHead>
										<TableHead>Classificação</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{relatorioData.map((item) => (
										<TableRow key={item.avaliacaoId}>
											<TableCell>{item.avaliacaoId}</TableCell>
											<TableCell>{item.templateNome}</TableCell>
											<TableCell>{item.unidadeNome}</TableCell>
											<TableCell>{item.avaliadorNome}</TableCell>
											<TableCell>
												{new Date(item.dataAvaliacao).toLocaleDateString(
													"pt-BR",
												)}
											</TableCell>
											<TableCell className="font-bold">
												{item.mediaFinal.toFixed(1)}
											</TableCell>
											<TableCell>
												<Badge
													variant={getClassificacaoBadgeVariant(
														item.classificacao,
													)}
													className="capitalize"
												>
													{item.classificacao}
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Comparativo entre Unidades */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart className="h-5 w-5" />
						Comparativo entre Unidades
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-4 items-end">
						<div>
							<label className="text-sm font-medium mb-2 block">
								Data Início
							</label>
							<Input
								type="date"
								value={filtrosComparativo.dataInicio}
								onChange={(e) =>
									setFiltrosComparativo((prev) => ({
										...prev,
										dataInicio: e.target.value,
									}))
								}
							/>
						</div>
						<div>
							<label className="text-sm font-medium mb-2 block">Data Fim</label>
							<Input
								type="date"
								value={filtrosComparativo.dataFim}
								onChange={(e) =>
									setFiltrosComparativo((prev) => ({
										...prev,
										dataFim: e.target.value,
									}))
								}
							/>
						</div>
						<Button onClick={gerarComparativo} disabled={loadingComparativo}>
							{loadingComparativo ? "Gerando..." : "Gerar Comparativo"}
						</Button>
					</div>

					{comparativoData && comparativoData.length > 0 && (
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-semibold">
									Ranking de Unidades ({comparativoData.length} unidades)
								</h3>
								<Button variant="outline" size="sm">
									<Download className="w-4 h-4 mr-2" />
									Exportar
								</Button>
							</div>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Posição</TableHead>
										<TableHead>Unidade</TableHead>
										<TableHead>Total Avaliações</TableHead>
										<TableHead>Média Geral</TableHead>
										<TableHead>Classificação</TableHead>
										<TableHead>Última Avaliação</TableHead>
										<TableHead>Tendência</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{comparativoData.map((unidade, index) => (
										<TableRow key={unidade.unidadeId}>
											<TableCell className="font-bold text-lg">
												{index + 1}º
											</TableCell>
											<TableCell className="font-medium">
												{unidade.unidadeNome}
											</TableCell>
											<TableCell>{unidade.totalAvaliacoes}</TableCell>
											<TableCell className="font-bold text-lg">
												{unidade.mediaGeral.toFixed(1)}
											</TableCell>
											<TableCell>
												<Badge
													variant={getClassificacaoBadgeVariant(
														unidade.classificacaoGeral,
													)}
													className="capitalize"
												>
													{unidade.classificacaoGeral}
												</Badge>
											</TableCell>
											<TableCell>
												{unidade.ultimaAvaliacao
													? new Date(
															unidade.ultimaAvaliacao,
														).toLocaleDateString("pt-BR")
													: "N/A"}
											</TableCell>
											<TableCell className="text-lg">
												{getTendenciaIcon(unidade.tendencia)}{" "}
												<span className="text-sm capitalize">
													{unidade.tendencia}
												</span>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
