import { RouteGuard } from "@/components/auth/route-guard";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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
import {
	type ColumnFiltersState,
	type SortingState,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	CheckCircle,
	ChevronDown,
	ChevronUp,
	ChevronsUpDown,
	Eye,
	MoreHorizontal,
	Package,
	Plus,
	XCircle,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute(
	"/admin/almoxarifado/solicitacoes/index/old",
)({
	component: RouteComponent,
	validateSearch: filtroSolicitacoesSchema,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const filtrosUrl = Route.useSearch();

	// Estados para TanStack Table
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	// Construir estado de ordenação a partir da URL
	const sorting: SortingState = filtrosUrl.sortField
		? [
				{
					id: filtrosUrl.sortField,
					desc: filtrosUrl.sortDirection === "desc",
				},
			]
		: [];

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

	// Função para atualizar ordenação via URL
	const handleSortingChange = (
		updaterOrValue: SortingState | ((old: SortingState) => SortingState),
	) => {
		const newSorting =
			typeof updaterOrValue === "function"
				? updaterOrValue(sorting)
				: updaterOrValue;
		const firstSort = newSorting[0];

		navigate({
			to: "/admin/almoxarifado/solicitacoes",
			search: {
				...filtrosUrl,
				sortField: firstSort?.id || undefined,
				sortDirection: firstSort
					? firstSort.desc
						? "desc"
						: "asc"
					: undefined,
				pagina: 1, // Reset para primeira página ao ordenar
			},
		});
	};

	// Configuração da tabela TanStack
	const table = useReactTable({
		data: data?.solicitacoes || [],
		columns,
		state: {
			sorting,
			columnFilters,
		},
		onSortingChange: handleSortingChange,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true, // Paginação manual via API
		manualSorting: true, // Ordenação manual via API
		pageCount: Math.ceil((data?.total || 0) / filtros.limite),
	});

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

	const limparFiltros = () => {
		setColumnFilters([]);
		navigate({
			to: "/admin/almoxarifado/solicitacoes",
			search: { pagina: 1, limite: 10 },
		});
	};

	const totalPaginas = data ? Math.ceil(data.total / filtros.limite) : 0;

	const subtitle =
		"Acompanhe e gerencie todas as solicitações do almoxarifado. Use os filtros na tabela para refinar os resultados.";

	const header = (
		<PageHeader
			title="Solicitações de Material"
			subtitle={subtitle}
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
					{/* Tabela de Solicitações */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Solicitações</CardTitle>
									<CardDescription>
										{isLoading
											? "Carregando..."
											: `${data?.total || 0} solicitações encontradas`}
									</CardDescription>
								</div>
								<Button variant="outline" onClick={limparFiltros}>
									Limpar Filtros
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<p className="text-muted-foreground">
										Carregando solicitações...
									</p>
								</div>
							) : (
								<>
									<Table>
										<TableHeader>
											{table.getHeaderGroups().map((headerGroup) => (
												<TableRow key={headerGroup.id}>
													{headerGroup.headers.map((header) => (
														<TableHead
															key={header.id}
															className={
																header.id === "actions" ? "w-[100px]" : ""
															}
														>
															{header.isPlaceholder ? null : (
																<div
																	className={
																		header.column.getCanSort()
																			? "flex items-center gap-2 cursor-pointer select-none hover:text-foreground"
																			: ""
																	}
																	onClick={header.column.getToggleSortingHandler()}
																	onKeyDown={(e) => {
																		if (e.key === "Enter" || e.key === " ") {
																			header.column.getToggleSortingHandler()?.(
																				e,
																			);
																		}
																	}}
																	tabIndex={header.column.getCanSort() ? 0 : -1}
																	role={
																		header.column.getCanSort()
																			? "button"
																			: undefined
																	}
																>
																	<div>
																		{flexRender(
																			header.column.columnDef.header,
																			header.getContext(),
																		)}
																	</div>
																	{header.column.getCanSort() && (
																		<div className="flex flex-col">
																			{header.column.getIsSorted() === "asc" ? (
																				<ChevronUp className="h-4 w-4" />
																			) : header.column.getIsSorted() ===
																				"desc" ? (
																				<ChevronDown className="h-4 w-4" />
																			) : (
																				<ChevronsUpDown className="h-4 w-4 opacity-50" />
																			)}
																		</div>
																	)}
																</div>
															)}
														</TableHead>
													))}
												</TableRow>
											))}
											{/* Linha de filtros por coluna */}
											{
												<TableRow>
													{table.getHeaderGroups()[0].headers.map((header) => (
														<TableHead
															key={"filter-${header.id}"}
															className="p-2"
														>
															{header.id === "status"
																? filtroStatus
																: header.id === "unidade"
																	? filtroUnidade
																	: header.id === "dataOperacao"
																		? filtroDataOperacao
																		: null}
														</TableHead>
													))}
												</TableRow>
											}
										</TableHeader>
										<TableBody>
											{table.getRowModel().rows.length ? (
												table.getRowModel().rows.map((row) => {
													const solicitacao = row.original;
													return (
														<TableRow
															key={row.id}
															data-state={row.getIsSelected() && "selected"}
															className="cursor-pointer hover:bg-muted/50"
															onClick={() => {
																navigate({
																	to: "/admin/almoxarifado/solicitacoes/$id",
																	params: { id: solicitacao.id.toString() },
																});
															}}
														>
															{row.getVisibleCells().map((cell) => (
																<TableCell
																	key={cell.id}
																	onClick={(e) => {
																		// Previne navegação quando clica no menu de ações
																		if (cell.column.id === "actions") {
																			e.stopPropagation();
																		}
																	}}
																>
																	{flexRender(
																		cell.column.columnDef.cell,
																		cell.getContext(),
																	)}
																</TableCell>
															))}
														</TableRow>
													);
												})
											) : (
												<TableRow>
													<TableCell
														colSpan={columns.length}
														className="h-24 text-center"
													>
														Não há resultados.
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>

									{/* Paginação integrada com TanStack Table */}
									{(totalPaginas > 1 || (data?.total || 0) > 0) && (
										<div className="flex items-center justify-between pt-4">
											<div className="flex items-center gap-4">
												<div className="flex items-center gap-2">
													<p className="text-sm text-muted-foreground">
														Página {filtrosUrl.pagina} de {totalPaginas || 1}
													</p>
													<div className="text-sm text-muted-foreground">
														({data?.total || 0} solicitações no total)
													</div>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-sm text-muted-foreground">
														Itens por página:
													</span>
													<Select
														value={filtrosUrl.limite.toString()}
														onValueChange={(value) => {
															navigate({
																to: "/admin/almoxarifado/solicitacoes",
																search: {
																	...filtrosUrl,
																	limite: Number(value),
																	pagina: 1,
																},
															});
														}}
													>
														<SelectTrigger className="h-8 w-[70px]">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="10">10</SelectItem>
															<SelectItem value="20">20</SelectItem>
															<SelectItem value="30">30</SelectItem>
															<SelectItem value="50">50</SelectItem>
															<SelectItem value="100">100</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
											{totalPaginas > 1 && (
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															const novaPagina = Math.max(
																1,
																filtrosUrl.pagina - 1,
															);
															navigate({
																to: "/admin/almoxarifado/solicitacoes",
																search: {
																	...filtrosUrl,
																	pagina: novaPagina,
																},
															});
														}}
														disabled={filtrosUrl.pagina === 1}
													>
														Anterior
													</Button>
													<span className="text-sm text-muted-foreground px-2">
														{filtrosUrl.pagina} / {totalPaginas}
													</span>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															const novaPagina = Math.min(
																totalPaginas,
																filtrosUrl.pagina + 1,
															);
															navigate({
																to: "/admin/almoxarifado/solicitacoes",
																search: {
																	...filtrosUrl,
																	pagina: novaPagina,
																},
															});
														}}
														disabled={filtrosUrl.pagina === totalPaginas}
													>
														Próxima
													</Button>
												</div>
											)}
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
