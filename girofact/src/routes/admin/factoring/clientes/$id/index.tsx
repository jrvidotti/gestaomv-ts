import { RouteGuard } from "@/components/auth/route-guard";
import { AnexosCliente } from "@/components/factoring/cliente/anexos-cliente";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	CreditCard,
	DollarSign,
	Edit,
	FileText,
	Mail,
	MapPin,
	Phone,
	TrendingUp,
	Users,
} from "lucide-react";

export const Route = createFileRoute("/admin/factoring/clientes/$id/")({
	component: ClienteDetailsPage,
});

function ClienteDetailsPage() {
	const { id } = Route.useParams();
	const trpc = useTRPC();

	// Buscar dados do cliente
	const {
		data: cliente,
		isLoading,
		error,
	} = useQuery(
		trpc.factoring.clientes.findById.queryOptions({
			id: Number.parseInt(id),
		}),
	);

	// Buscar estatísticas do cliente
	const { data: estatisticas, isLoading: isLoadingStats } = useQuery(
		trpc.factoring.clientes.obterEstatisticasCliente.queryOptions({
			clienteId: Number.parseInt(id),
		}),
	);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const formatDocument = (documento: string, tipo: "fisica" | "juridica") => {
		if (tipo === "fisica") {
			return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
		}
		return documento.replace(
			/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
			"$1.$2.$3/$4-$5",
		);
	};

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return "-";
		return new Date(dateStr).toLocaleDateString("pt-BR");
	};

	const getStatusBadge = (status: string) => {
		const variants = {
			ativo: "default",
			inativo: "secondary",
			bloqueado: "destructive",
			suspenso: "outline",
		} as const;

		const labels = {
			ativo: "Ativo",
			inativo: "Inativo",
			bloqueado: "Bloqueado",
			suspenso: "Suspenso",
		} as const;

		return (
			<Badge variant={variants[status as keyof typeof variants] || "secondary"}>
				{labels[status as keyof typeof labels] || status}
			</Badge>
		);
	};

	const header = (
		<PageHeader
			title="Detalhes do Cliente"
			subtitle={cliente ? cliente.pessoa.nomeRazaoSocial : "Carregando..."}
			icon={<Users className="h-5 w-5" />}
			actions={[
				<Button key="back" asChild variant="outline">
					<Link to="/admin/factoring/clientes">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar
					</Link>
				</Button>,
			]}
		/>
	);

	if (isLoading) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-7xl mx-auto space-y-6">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="h-48 bg-muted animate-pulse rounded" />
						))}
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	if (error || !cliente) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-7xl mx-auto">
						<div className="text-center py-12">
							<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-medium">Cliente não encontrado</h3>
							<p className="text-muted-foreground mb-4">
								O cliente que você está procurando não existe.
							</p>
							<Button asChild>
								<Link to="/admin/factoring/clientes">Voltar à lista</Link>
							</Button>
						</div>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	return (
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="max-w-7xl mx-auto space-y-6">
					{/* Cards de Estatísticas */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Limite Disponível
										</p>
										<p className="text-2xl font-bold text-green-600">
											{formatCurrency(
												cliente.limiteCredito -
													(estatisticas?.limiteUtilizado || 0),
											)}
										</p>
									</div>
									<CreditCard className="h-8 w-8 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Documentos Ativos
										</p>
										<p className="text-2xl font-bold">
											{estatisticas?.documentosAtivos || 0}
										</p>
									</div>
									<FileText className="h-8 w-8 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Operações
										</p>
										<p className="text-2xl font-bold">
											{estatisticas?.totalOperacoes || 0}
										</p>
									</div>
									<TrendingUp className="h-8 w-8 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Saldo Atual
										</p>
										<p
											className={`text-2xl font-bold ${(estatisticas?.saldoAtual || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
										>
											{formatCurrency(estatisticas?.saldoAtual || 0)}
										</p>
									</div>
									<DollarSign className="h-8 w-8 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Informações Básicas */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Informações da Pessoa */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0">
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Dados da Pessoa
								</CardTitle>
								<Button asChild size="sm" variant="outline">
									<Link
										to="/admin/factoring/pessoas/$id/editar"
										params={{ id: cliente.pessoaId.toString() }}
										search={{ from: "cliente", clienteId: id }}
									>
										<Edit className="h-4 w-4 mr-2" />
										Editar Pessoa
									</Link>
								</Button>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Tipo de Pessoa
									</label>
									<div className="mt-1">
										<Badge
											variant={
												cliente.pessoa.tipoPessoa === "fisica"
													? "default"
													: "secondary"
											}
										>
											{cliente.pessoa.tipoPessoa === "fisica"
												? "Pessoa Física"
												: "Pessoa Jurídica"}
										</Badge>
									</div>
								</div>

								<div>
									<label className="text-sm font-medium text-muted-foreground">
										{cliente.pessoa.tipoPessoa === "fisica" ? "CPF" : "CNPJ"}
									</label>
									<div className="mt-1 font-mono">
										{formatDocument(
											cliente.pessoa.documento,
											cliente.pessoa.tipoPessoa,
										)}
									</div>
								</div>

								<div>
									<label className="text-sm font-medium text-muted-foreground">
										{cliente.pessoa.tipoPessoa === "fisica"
											? "Nome Completo"
											: "Razão Social"}
									</label>
									<div className="mt-1 font-medium text-lg">
										{cliente.pessoa.nomeRazaoSocial}
									</div>
								</div>

								{cliente.pessoa.nomeFantasia && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Nome Fantasia
										</label>
										<div className="mt-1">{cliente.pessoa.nomeFantasia}</div>
									</div>
								)}

								{cliente.pessoa.email && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											<Mail className="h-4 w-4 inline mr-1" />
											E-mail
										</label>
										<div className="mt-1">
											<a
												href={`mailto:${cliente.pessoa.email}`}
												className="text-blue-600 hover:underline"
											>
												{cliente.pessoa.email}
											</a>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0">
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Informações do Cliente
								</CardTitle>
								<Button asChild size="sm">
									<Link
										to="/admin/factoring/clientes/$id/editar"
										params={{ id }}
									>
										<Edit className="h-4 w-4 mr-2" />
										Editar
									</Link>
								</Button>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Status
										</label>
										<div className="mt-1">{getStatusBadge(cliente.status)}</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Crédito Autorizado
										</label>
										<div className="mt-1">
											<Badge
												variant={
													cliente.creditoAutorizado ? "default" : "secondary"
												}
											>
												{cliente.creditoAutorizado ? "Sim" : "Não"}
											</Badge>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Limite de Crédito
										</label>
										<div className="mt-1 text-lg font-semibold">
											{formatCurrency(cliente.limiteCredito)}
										</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Taxa de Juros Padrão
										</label>
										<div className="mt-1 text-lg font-semibold">
											{cliente.taxaJurosPadrao}% a.m.
										</div>
									</div>
								</div>

								{cliente.dataUltimaAnaliseCredito && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											<Calendar className="h-4 w-4 inline mr-1" />
											Última Análise de Crédito
										</label>
										<div className="mt-1">
											{formatDate(cliente.dataUltimaAnaliseCredito)}
										</div>
									</div>
								)}

								{cliente.observacoesCliente && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Observações
										</label>
										<div className="mt-1 text-sm p-3 bg-muted rounded-lg">
											{cliente.observacoesCliente}
										</div>
									</div>
								)}

								{/* Tarifas integradas no card */}
								{(cliente.tarifaDevolucaoCheques ||
									cliente.tarifaProrrogacao ||
									cliente.tarifaProtesto ||
									cliente.tarifaResgate) && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											<DollarSign className="h-4 w-4 inline mr-1" />
											Tarifas
										</label>
										<div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-3">
											{cliente.tarifaDevolucaoCheques && (
												<div>
													<span className="text-xs text-muted-foreground">
														Devolução de Cheques
													</span>
													<div className="font-semibold">
														{formatCurrency(cliente.tarifaDevolucaoCheques)}
													</div>
												</div>
											)}
											{cliente.tarifaProrrogacao && (
												<div>
													<span className="text-xs text-muted-foreground">
														Prorrogação
													</span>
													<div className="font-semibold">
														{formatCurrency(cliente.tarifaProrrogacao)}
													</div>
												</div>
											)}
											{cliente.tarifaProtesto && (
												<div>
													<span className="text-xs text-muted-foreground">
														Protesto
													</span>
													<div className="font-semibold">
														{formatCurrency(cliente.tarifaProtesto)}
													</div>
												</div>
											)}
											{cliente.tarifaResgate && (
												<div>
													<span className="text-xs text-muted-foreground">
														Resgate
													</span>
													<div className="font-semibold">
														{formatCurrency(cliente.tarifaResgate)}
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Anexos do Cliente */}
					<AnexosCliente clienteId={Number.parseInt(id)} />

					{/* TODO: Adicionar componentes de estatísticas detalhadas */}
					{/* - Carteira de Documentos */}
					{/* - Histórico de Operações */}
					{/* - Contatos de Referência */}

					{/* Informações de Sistema */}
					<Card>
						<CardHeader>
							<CardTitle>Informações do Sistema</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Cliente desde
									</label>
									<div className="mt-1">{formatDate(cliente.criadoEm)}</div>
								</div>
								{cliente.atualizadoEm && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Última atualização
										</label>
										<div className="mt-1">
											{formatDate(cliente.atualizadoEm)}
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
