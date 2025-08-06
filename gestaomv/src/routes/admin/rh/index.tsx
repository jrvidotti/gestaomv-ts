import { RouteGuard } from "@/components/auth/route-guard";
import { CardStats } from "@/components/card-stats";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ALL_ROLES } from "@/constants";
import { STATUS_FUNCIONARIO } from "@/modules/rh/consts";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	Briefcase,
	Building2,
	ClipboardCheck,
	Clock,
	Filter,
	Plus,
	Target,
	TrendingUp,
	UserCheck,
	UserX,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

type PeriodoPreset = {
	label: string;
	value: string;
	dataInicial?: Date;
	dataFinal?: Date;
};

const obterPeriodosPreset = (): PeriodoPreset[] => {
	const agora = new Date();
	const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

	return [
		{
			label: "Todos os períodos",
			value: "all",
		},
		{
			label: "Últimos 30 dias",
			value: "30d",
			dataInicial: new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000),
			dataFinal: hoje,
		},
		{
			label: "Últimos 90 dias",
			value: "90d",
			dataInicial: new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000),
			dataFinal: hoje,
		},
		{
			label: "Último ano",
			value: "365d",
			dataInicial: new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000),
			dataFinal: hoje,
		},
	];
};

export const Route = createFileRoute("/admin/rh/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [periodoSelecionado, setPeriodoSelecionado] = useState<string>("all");

	const trpc = useTRPC();
	const periodosPreset = obterPeriodosPreset();
	const periodoAtual = periodosPreset.find(
		(p) => p.value === periodoSelecionado,
	);

	// Determinar filtros baseado na seleção
	const filtros = useMemo(
		() => ({
			...(periodoSelecionado !== "all" && periodoAtual
				? {
						dataInicial: periodoAtual.dataInicial,
						dataFinal: periodoAtual.dataFinal,
					}
				: {}),
		}),
		[periodoSelecionado, periodoAtual],
	);

	const { data: estatisticas, isLoading: carregandoStats } = useQuery(
		trpc.rh.obterEstatisticas.queryOptions(filtros),
	);
	const { data: departamentos, isLoading: carregandoDepartamentos } = useQuery(
		trpc.rh.obterEstatisticasDepartamentos.queryOptions(filtros),
	);
	const { data: proximasAvaliacoes, isLoading: carregandoAvaliacoes } =
		useQuery(trpc.rh.obterProximasAvaliacoes.queryOptions({ limite: 5 }));

	const obterDescricaoPeriodo = () => {
		return periodoAtual?.label || "Todos os períodos";
	};

	const stats = [
		{
			title: "Funcionários Ativos",
			value: carregandoStats
				? "..."
				: estatisticas?.funcionariosAtivos?.toString() || "0",
			description: "Funcionários em atividade",
			icon: Users,
			trend: "up",
		},
		{
			title: "Equipes Ativas",
			value: carregandoStats
				? "..."
				: estatisticas?.equipesAtivas?.toString() || "0",
			description: "Equipes registradas",
			icon: Building2,
			trend: "up",
		},
		{
			title: "Departamentos",
			value: carregandoStats
				? "..."
				: estatisticas?.totalDepartamentos?.toString() || "0",
			description: "Departamentos cadastrados",
			icon: Briefcase,
			trend: "up",
		},
		{
			title: "Avaliações Pendentes",
			value: carregandoStats
				? "..."
				: estatisticas?.avaliacoesPendentes?.toString() || "0",
			description: "Avaliações para realizar",
			icon: ClipboardCheck,
			trend: "neutral",
		},
	];

	// Dados para gráfico de status de funcionários
	const dadosStatus = estatisticas
		? [
				{
					name: "Ativos",
					value: estatisticas.funcionariosPorStatus.ativo,
					color: "#00C49F",
				},
				{
					name: "Período Experiência",
					value: estatisticas.funcionariosPorStatus.periodoExperiencia,
					color: "#FFBB28",
				},
				{
					name: "Em Contratação",
					value: estatisticas.funcionariosPorStatus.emContratacao,
					color: "#0088FE",
				},
				{
					name: "Aviso Prévio",
					value: estatisticas.funcionariosPorStatus.avisoPrevio,
					color: "#FF8042",
				},
			].filter((item) => item.value > 0)
		: [];

	// Dados para gráfico de departamentos
	const dadosDepartamentos =
		departamentos?.map((dept, index) => ({
			name:
				dept.nome.length > 15 ? `${dept.nome.substring(0, 15)}...` : dept.nome,
			funcionarios: dept.totalFuncionarios,
			color: COLORS[index % COLORS.length],
		})) || [];

	const header = (
		<PageHeader
			title="Recursos Humanos"
			subtitle={`Gerencie funcionários, equipes e avaliações • ${obterDescricaoPeriodo()}`}
			actions={[
				<Link key="novo-funcionario" to="/admin/rh/funcionarios/novo">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Novo Funcionário
					</Button>
				</Link>,
			]}
		/>
	);

	return (
		<RouteGuard
			requiredRoles={[
				ALL_ROLES.ADMIN,
				ALL_ROLES.GERENCIA_RH,
				ALL_ROLES.USUARIO_RH,
			]}
		>
			<AdminLayout header={header}>
				<div className="space-y-6">
					{/* Seletor de Período */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Filter className="h-5 w-5" />
								Filtros
							</CardTitle>
							<CardDescription>
								Selecione o período para análise dos dados
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4 md:flex-row md:items-end">
								<div>
									<label className="text-sm font-medium mb-2 block">
										Período
									</label>
									<Select
										value={periodoSelecionado}
										onValueChange={setPeriodoSelecionado}
									>
										<SelectTrigger className="w-64">
											<SelectValue placeholder="Selecione o período" />
										</SelectTrigger>
										<SelectContent>
											{periodosPreset.map((periodo) => (
												<SelectItem key={periodo.value} value={periodo.value}>
													{periodo.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{periodoSelecionado !== "all" && (
									<Button
										variant="outline"
										onClick={() => setPeriodoSelecionado("all")}
									>
										Limpar Filtros
									</Button>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Stats Cards */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{stats.map((card) => (
							<CardStats
								key={card.title}
								titulo={card.title}
								valor={card.value}
								icone={card.icon}
							/>
						))}
					</div>

					{/* Quick Actions */}
					<div className="grid gap-4 md:grid-cols-3">
						<Link to="/admin/rh/funcionarios">
							<Card className="hover:bg-accent cursor-pointer transition-colors">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Users className="h-5 w-5" />
										Funcionários
									</CardTitle>
									<CardDescription>
										Gerenciar funcionários da empresa
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant="ghost" className="w-full">
										Acessar Funcionários
									</Button>
								</CardContent>
							</Card>
						</Link>

						<Link to="/admin/rh/equipes">
							<Card className="hover:bg-accent cursor-pointer transition-colors">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Building2 className="h-5 w-5" />
										Equipes
									</CardTitle>
									<CardDescription>
										Organizar equipes de trabalho
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant="ghost" className="w-full">
										Ver Equipes
									</Button>
								</CardContent>
							</Card>
						</Link>

						<Link to="/admin/rh/avaliacoes-experiencia">
							<Card className="hover:bg-accent cursor-pointer transition-colors">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<ClipboardCheck className="h-5 w-5" />
										Avaliações
									</CardTitle>
									<CardDescription>
										Avaliar desempenho dos funcionários
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant="ghost" className="w-full">
										Ver Avaliações
									</Button>
								</CardContent>
							</Card>
						</Link>
					</div>

					{/* Dashboard Analytics */}
					<div className="grid gap-6 md:grid-cols-2">
						{/* Status dos Funcionários */}
						<Card>
							<CardHeader>
								<CardTitle>Status dos Funcionários</CardTitle>
								<CardDescription>Distribuição por situação</CardDescription>
							</CardHeader>
							<CardContent>
								{carregandoStats ? (
									<div className="h-64 flex items-center justify-center">
										<p className="text-muted-foreground">Carregando...</p>
									</div>
								) : dadosStatus.length > 0 ? (
									<div className="h-64">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={dadosStatus}
													cx="50%"
													cy="50%"
													innerRadius={60}
													outerRadius={120}
													paddingAngle={5}
													dataKey="value"
													label={({ name, value }) => `${name}: ${value}`}
												>
													{dadosStatus.map((entry) => (
														<Cell
															key={`cell-${entry.name}`}
															fill={entry.color}
														/>
													))}
												</Pie>
												<Tooltip />
											</PieChart>
										</ResponsiveContainer>
									</div>
								) : (
									<div className="h-64 flex items-center justify-center">
										<p className="text-muted-foreground">
											Nenhum funcionário encontrado
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Funcionários por Departamento */}
						<Card>
							<CardHeader>
								<CardTitle>Funcionários por Departamento</CardTitle>
								<CardDescription>Distribuição organizacional</CardDescription>
							</CardHeader>
							<CardContent>
								{carregandoDepartamentos ? (
									<div className="h-64 flex items-center justify-center">
										<p className="text-muted-foreground">Carregando...</p>
									</div>
								) : dadosDepartamentos.length > 0 ? (
									<div className="h-64">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={dadosDepartamentos}>
												<XAxis
													dataKey="name"
													angle={-45}
													textAnchor="end"
													height={80}
													fontSize={12}
												/>
												<YAxis />
												<Tooltip />
												<Legend />
												<Bar
													dataKey="funcionarios"
													fill="#8884d8"
													name="Funcionários"
												/>
											</BarChart>
										</ResponsiveContainer>
									</div>
								) : (
									<div className="h-64 flex items-center justify-center">
										<p className="text-muted-foreground">
											Nenhum departamento encontrado
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Próximas Avaliações */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Target className="h-5 w-5" />
								Próximas Avaliações
							</CardTitle>
							<CardDescription>
								Funcionários que precisam ser avaliados
							</CardDescription>
						</CardHeader>
						<CardContent>
							{carregandoAvaliacoes ? (
								<p className="text-muted-foreground">Carregando...</p>
							) : proximasAvaliacoes && proximasAvaliacoes.length > 0 ? (
								<div className="space-y-4">
									{proximasAvaliacoes.map((avaliacao) => (
										<div
											key={avaliacao.funcionarioId}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div className="flex items-center gap-3">
												<div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full">
													<Clock className="h-5 w-5" />
												</div>
												<div>
													<h4 className="font-semibold">
														{avaliacao.funcionarioNome}
													</h4>
													<p className="text-sm text-muted-foreground">
														{avaliacao.tipo === "EXPERIENCIA"
															? "Avaliação de Experiência"
															: "Avaliação Periódica"}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium">
													{new Date(
														avaliacao.dataVencimento,
													).toLocaleDateString("pt-BR")}
												</p>
												<p className="text-xs text-muted-foreground">
													{avaliacao.diasRestantes > 0
														? `${avaliacao.diasRestantes} dias restantes`
														: "Vencida"}
												</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<ClipboardCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
									<p className="text-muted-foreground">
										Nenhuma avaliação pendente
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Links Rápidos por Status */}
					{!carregandoStats && estatisticas && (
						<Card>
							<CardHeader>
								<CardTitle>Acesso Rápido por Status</CardTitle>
								<CardDescription>
									Visualizar funcionários por situação
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 md:grid-cols-4">
									<Link
										to="/admin/rh/funcionarios"
										search={{ status: STATUS_FUNCIONARIO.ATIVO }}
									>
										<div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
											<UserCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
											<p className="text-2xl font-bold">
												{estatisticas.funcionariosPorStatus.ativo}
											</p>
											<p className="text-sm text-muted-foreground">Ativos</p>
										</div>
									</Link>
									<Link
										to="/admin/rh/funcionarios"
										search={{ status: STATUS_FUNCIONARIO.PERIODO_EXPERIENCIA }}
									>
										<div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
											<Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
											<p className="text-2xl font-bold">
												{estatisticas.funcionariosPorStatus.periodoExperiencia}
											</p>
											<p className="text-sm text-muted-foreground">
												Em Experiência
											</p>
										</div>
									</Link>
									<Link
										to="/admin/rh/funcionarios"
										search={{ status: STATUS_FUNCIONARIO.EM_CONTRATACAO }}
									>
										<div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
											<Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
											<p className="text-2xl font-bold">
												{estatisticas.funcionariosPorStatus.emContratacao}
											</p>
											<p className="text-sm text-muted-foreground">
												Em Contratação
											</p>
										</div>
									</Link>
									<Link
										to="/admin/rh/funcionarios"
										search={{ status: STATUS_FUNCIONARIO.AVISO_PREVIO }}
									>
										<div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
											<UserX className="h-8 w-8 mx-auto mb-2 text-red-500" />
											<p className="text-2xl font-bold">
												{estatisticas.funcionariosPorStatus.avisoPrevio}
											</p>
											<p className="text-sm text-muted-foreground">
												Aviso Prévio
											</p>
										</div>
									</Link>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
