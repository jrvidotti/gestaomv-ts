import { RouteGuard } from "@/components/auth/route-guard";
import { DataTable, useDataTable } from "@/components/data-table";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ALL_ROLES } from "@/constants";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
	STATUS_OPTIONS,
	STATUS_SOLICITACAO_DATA,
} from "@/modules/almoxarifado/consts";
import { filtroSolicitacoesSchema } from "@/modules/almoxarifado/dtos";
import { STATUS_SOLICITACAO } from "@/modules/almoxarifado/enums";
import type { SolicitacaoMaterial } from "@/modules/almoxarifado/types";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import {
	CheckCircle,
	Eye,
	MoreHorizontal,
	Package,
	Plus,
	XCircle,
} from "lucide-react";

export const Route = createFileRoute("/admin/almoxarifado/solicitacoes/")({
	component: RouteComponent,
	validateSearch: filtroSolicitacoesSchema,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const filtrosUrl = Route.useSearch();
	const trpc = useTRPC();

	// Construir filtros usando URL como fonte da verdade
	const filtros = {
		pagina: filtrosUrl.pagina,
		limite: filtrosUrl.limite,
		...(filtrosUrl.status && { status: filtrosUrl.status as any }),
		...(filtrosUrl.unidadeId && { unidadeId: Number(filtrosUrl.unidadeId) }),
		...(filtrosUrl.solicitanteId && {
			solicitanteId: Number(filtrosUrl.solicitanteId),
		}),
		...(filtrosUrl.dataInicial && { dataInicial: filtrosUrl.dataInicial }),
		...(filtrosUrl.dataFinal && { dataFinal: filtrosUrl.dataFinal }),
		...(filtrosUrl.sortField && { sortField: filtrosUrl.sortField }),
		...(filtrosUrl.sortDirection && {
			sortDirection: filtrosUrl.sortDirection,
		}),
	};

	const { data, isLoading, refetch } = useQuery(
		trpc.almoxarifado.solicitacoes.listar.queryOptions(filtros),
	);

	// Query para listar unidades
	const { data: unidades } = useQuery(trpc.unidades.listar.queryOptions());

	// Mutations
	const { mutate: aprovarSolicitacao } = useMutation({
		...trpc.almoxarifado.solicitacoes.aprovarOuRejeitar.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
	});

	const { mutate: atenderSolicitacao } = useMutation({
		...trpc.almoxarifado.solicitacoes.atender.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
	});

	// Configuração do hook de data table
	const dataTable = useDataTable({
		data: data?.solicitacoes || [],
		totalCount: data?.total || 0,
		currentPage: filtrosUrl.pagina,
		currentPageSize: filtrosUrl.limite,
		currentSortField: filtrosUrl.sortField,
		currentSortDirection: filtrosUrl.sortDirection,
		navigateTo: "/admin/almoxarifado/solicitacoes",
	});

	// Definições de colunas
	const columnHelper = createColumnHelper<SolicitacaoMaterial>();

	const formatDateTime = (date: string | Date) => {
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

	const isAdmin =
		user?.roles?.includes(ALL_ROLES.ADMIN) ||
		user?.roles?.includes(ALL_ROLES.ALMOXARIFADO_GERENCIA);

	const columns = [
		columnHelper.accessor("id", {
			header: "Solicitação",
			cell: (info) => (
				<span className="font-mono">
					#{info.getValue().toString().padStart(6, "0")}
				</span>
			),
			enableSorting: true,
		}),
		columnHelper.accessor("solicitante", {
			header: "Solicitante",
			cell: (info) => {
				const solicitante = info.getValue();
				return (
					<div>
						<p className="font-medium">{solicitante?.name || "N/A"}</p>
						<p className="text-sm text-muted-foreground">
							{solicitante?.email || ""}
						</p>
					</div>
				);
			},
			enableSorting: true,
			sortingFn: (rowA, rowB) => {
				const nameA = rowA.original.solicitante?.name || "";
				const nameB = rowB.original.solicitante?.name || "";
				return nameA.localeCompare(nameB);
			},
		}),
		columnHelper.accessor("unidade", {
			header: "Unidade",
			cell: (info) => info.getValue()?.nome || "N/A",
			enableSorting: true,
			sortingFn: (rowA, rowB) => {
				const nomeA = rowA.original.unidade?.nome || "";
				const nomeB = rowB.original.unidade?.nome || "";
				return nomeA.localeCompare(nomeB);
			},
		}),
		columnHelper.accessor("status", {
			header: "Status",
			cell: (info) => (
				<Badge variant={STATUS_SOLICITACAO_DATA[info.getValue()].variant}>
					{STATUS_SOLICITACAO_DATA[info.getValue()].label}
				</Badge>
			),
			enableSorting: true,
		}),
		columnHelper.accessor("dataOperacao", {
			header: "Data",
			cell: (info) => (
				<span className="text-sm">{formatDateTime(info.getValue())}</span>
			),
			enableSorting: true,
		}),
		columnHelper.accessor("itens", {
			header: "Itens",
			cell: (info) => {
				const itens = info.getValue() || [];
				const totalItens = itens.length;
				const totalUnidades = itens.reduce(
					(acc, item) => acc + (item.qtdSolicitada || 0),
					0,
				);
				return (
					<div className="text-sm">
						<p>{totalItens} itens</p>
						<p className="text-muted-foreground">{totalUnidades} unidades</p>
					</div>
				);
			},
			enableSorting: true,
			sortingFn: (rowA, rowB) => {
				const itensA = rowA.original.itens?.length || 0;
				const itensB = rowB.original.itens?.length || 0;
				return itensA - itensB;
			},
		}),
		columnHelper.display({
			id: "actions",
			header: "Ações",
			cell: (info) => {
				const solicitacao = info.row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<Link
								to="/admin/almoxarifado/solicitacoes/$id"
								params={{ id: solicitacao.id.toString() }}
							>
								<DropdownMenuItem>
									<Eye className="h-4 w-4 mr-2" />
									Visualizar
								</DropdownMenuItem>
							</Link>
							{isAdmin &&
								solicitacao.status === STATUS_SOLICITACAO.PENDENTE && (
									<>
										<DropdownMenuItem
											onClick={() => handleAprovar(solicitacao.id)}
											className="text-green-600"
										>
											<CheckCircle className="h-4 w-4 mr-2" />
											Aprovar
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleRejeitar(solicitacao.id)}
											className="text-destructive"
										>
											<XCircle className="h-4 w-4 mr-2" />
											Rejeitar
										</DropdownMenuItem>
									</>
								)}
							{isAdmin &&
								solicitacao.status === STATUS_SOLICITACAO.APROVADA && (
									<DropdownMenuItem
										onClick={() => handleAtender(solicitacao.id)}
										className="text-green-600"
									>
										<Package className="h-4 w-4 mr-2" />
										Atender
									</DropdownMenuItem>
								)}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		}),
	];

	// Handlers das ações
	const handleAprovar = async (id: number) => {
		if (confirm("Deseja aprovar esta solicitação?")) {
			aprovarSolicitacao({
				id,
				data: { status: STATUS_SOLICITACAO.APROVADA },
			});
		}
	};

	const handleRejeitar = async (id: number) => {
		const motivo = prompt("Informe o motivo da rejeição (obrigatório):");
		if (motivo?.trim()) {
			aprovarSolicitacao({
				id,
				data: {
					status: STATUS_SOLICITACAO.REJEITADA,
					motivoRejeicao: motivo.trim(),
				},
			});
		} else if (motivo !== null) {
			alert("O motivo da rejeição é obrigatório.");
		}
	};

	const handleAtender = async (id: number) => {
		if (
			confirm(
				"Confirma que os materiais foram separados e as quantidades estão corretas?\n\nEsta ação marcará a solicitação como ATENDIDA.",
			)
		) {
			const solicitacao = data?.solicitacoes.find((s) => s.id === id);
			if (!solicitacao || !solicitacao.itens) {
				alert("Solicitação não encontrada ou sem itens");
				return;
			}

			const itensAtendimento = solicitacao.itens.map((item) => ({
				id: item.id,
				qtdAtendida: item.qtdSolicitada,
			}));

			atenderSolicitacao({
				id,
				data: {
					itens: itensAtendimento as any,
				},
			});
		}
	};

	// Handlers dos filtros
	const handleStatusFilter = (value: string) => {
		navigate({
			to: "/admin/almoxarifado/solicitacoes",
			search: {
				...filtrosUrl,
				status: value === "all" ? undefined : value,
				pagina: 1,
			},
		});
	};

	const handleUnidadeFilter = (value: string) => {
		navigate({
			to: "/admin/almoxarifado/solicitacoes",
			search: {
				...filtrosUrl,
				unidadeId: value === "all" ? undefined : Number(value),
				pagina: 1,
			},
		});
	};

	const handleDateFilter = (dates: {
		dataInicial?: string;
		dataFinal?: string;
	}) => {
		navigate({
			to: "/admin/almoxarifado/solicitacoes",
			search: {
				...filtrosUrl,
				dataInicial: dates.dataInicial,
				dataFinal: dates.dataFinal,
				pagina: 1,
			},
		});
	};

	const handleRowClick = (solicitacao: SolicitacaoMaterial) => {
		navigate({
			to: "/admin/almoxarifado/solicitacoes/$id",
			params: { id: solicitacao.id.toString() },
		});
	};

	// Componentes de filtro
	const filtroStatus = (
		<Select
			value={filtrosUrl.status || "all"}
			onValueChange={handleStatusFilter}
		>
			<SelectTrigger
				className={cn("h-8 w-full", {
					"bg-accent": filtrosUrl.status && filtrosUrl.status !== "all",
				})}
			>
				<SelectValue placeholder="Status" />
			</SelectTrigger>
			<SelectContent>
				{STATUS_OPTIONS.map((status) => (
					<SelectItem key={status.value} value={status.value}>
						{status.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);

	const filtroUnidade = (
		<Select
			value={filtrosUrl.unidadeId?.toString() || "all"}
			onValueChange={handleUnidadeFilter}
		>
			<SelectTrigger
				className={cn("h-8 w-full", {
					"bg-accent": filtrosUrl.unidadeId,
				})}
			>
				<SelectValue placeholder="Unidade" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">Todas</SelectItem>
				{unidades?.map((unidade) => (
					<SelectItem key={unidade.id} value={unidade.id.toString()}>
						{unidade.nome}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);

	const filtroDataOperacao = (
		<DateRangeFilter
			value={{
				dataInicial: filtrosUrl.dataInicial,
				dataFinal: filtrosUrl.dataFinal,
			}}
			onValueChange={handleDateFilter}
			placeholder="Filtrar por data"
			className={
				filtrosUrl.dataInicial || filtrosUrl.dataFinal ? "bg-accent" : ""
			}
		/>
	);

	// Header da página
	const header = (
		<PageHeader
			title="Solicitações de Material"
			subtitle="Acompanhe e gerencie todas as solicitações do almoxarifado. Use os filtros na tabela para refinar os resultados."
			actions={[
				<Link key="nova-solicitacao" to="/admin/almoxarifado/solicitacoes/nova">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Nova Solicitação
					</Button>
				</Link>,
			]}
		/>
	);

	return (
		<RouteGuard
			requiredRoles={[
				ALL_ROLES.ADMIN,
				ALL_ROLES.ALMOXARIFADO_GERENCIA,
				ALL_ROLES.ALMOXARIFADO_USUARIO,
			]}
		>
			<AdminLayout header={header}>
				<div className="space-y-6">
					<DataTable
						{...dataTable.getTableProps()}
						columns={columns}
						data={data?.solicitacoes || []}
						isLoading={isLoading}
						title="Solicitações"
						onRowClick={handleRowClick}
						filterComponents={{
							status: filtroStatus,
							unidade: filtroUnidade,
							dataOperacao: filtroDataOperacao,
						}}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
