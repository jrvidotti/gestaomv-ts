import { RouteGuard } from "@/components/auth/route-guard";
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
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import { useTRPC } from "@/integrations/trpc/react";
import {
	STATUS_OPTIONS,
	STATUS_SOLICITACAO_DATA,
} from "@/modules/almoxarifado/consts";
import { STATUS_SOLICITACAO } from "@/modules/almoxarifado/enums";
import type { StatusSolicitacaoType } from "@/modules/almoxarifado/types";
import { USER_ROLES } from "@/modules/core/enums";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	createColumnHelper,
	flexRender,
	type SortingState,
	type ColumnFiltersState,
} from "@tanstack/react-table";
import {
	CheckCircle,
	ClipboardList,
	Eye,
	Filter,
	MoreHorizontal,
	Package,
	Plus,
	Search,
	XCircle,
	ChevronUp,
	ChevronDown,
	ChevronsUpDown,
} from "lucide-react";
import { useEffect, useState } from "react";

type SolicitacoesSearch = {
	status?: StatusSolicitacaoType;
	busca?: string;
	pagina?: number;
};

// Tipo para dados das solicitações (inferido da API)
type SolicitacaoData = {
	id: number;
	status: StatusSolicitacaoType;
	dataOperacao: string;
	solicitante?: {
		name: string;
		email: string;
	} | null;
	unidade?: {
		nome: string;
	} | null;
	itens?: Array<{
		id: number;
		qtdSolicitada: number;
	}> | null;
};

export const Route = createFileRoute("/admin/almoxarifado/solicitacoes/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): SolicitacoesSearch => {
		return {
			status:
				typeof search.status === "string"
					? (search.status as StatusSolicitacaoType)
					: undefined,
			busca: typeof search.busca === "string" ? search.busca : undefined,
			pagina: typeof search.pagina === "number" ? search.pagina : 1,
		};
	},
});

function RouteComponent() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const {
		status: statusUrl,
		busca: buscaUrl,
		pagina: paginaUrl,
	} = Route.useSearch();

	const [busca, setBusca] = useState(buscaUrl || "");
	const [statusSelecionado, setStatusSelecionado] = useState<
		StatusSolicitacaoType | "all"
	>(statusUrl || "all");
	const [paginaAtual, setPaginaAtual] = useState(paginaUrl || 1);

	// Estados para TanStack Table
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [showColumnFilters, setShowColumnFilters] = useState(false);

	const trpc = useTRPC();
	const buscaDebounced = useDebounce(busca, 300);

	// Definições de colunas
	const columnHelper = createColumnHelper<SolicitacaoData>();

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
		user?.roles?.includes(USER_ROLES.ADMIN) ||
		user?.roles?.includes(USER_ROLES.GERENCIA_ALMOXARIFADO);

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
					(acc, item) => acc + item.qtdSolicitada,
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

	// Aplicar filtros da URL quando o componente carrega
	useEffect(() => {
		if (statusUrl && statusUrl !== statusSelecionado) {
			setStatusSelecionado(statusUrl);
		}
	}, [statusUrl, statusSelecionado]);

	const filtros = {
		status:
			statusSelecionado && statusSelecionado !== "all"
				? statusSelecionado
				: undefined,
		busca: buscaDebounced || undefined,
		pagina: paginaAtual,
		limite: 20,
	};

	const { data, isLoading, refetch } = useQuery(
		trpc.almoxarifado.solicitacoes.listar.queryOptions(filtros),
	);

	// Configuração da tabela TanStack
	const table = useReactTable({
		data: data?.solicitacoes || [],
		columns,
		state: {
			sorting,
			columnFilters,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true, // Paginação manual via API
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
					itens: itensAtendimento,
				},
			});
		}
	};

	const limparFiltros = () => {
		setBusca("");
		setStatusSelecionado("all");
		setPaginaAtual(1);
		setSorting([]);
		setColumnFilters([]);
		navigate({
			to: "/admin/almoxarifado/solicitacoes",
			search: {},
		});
	};

	const totalPaginas = data ? Math.ceil(data.total / filtros.limite) : 0;

	const obterSubtitle = () => {
		let subtitle = "Acompanhe e gerencie todas as solicitações do almoxarifado";
		if (statusSelecionado && statusSelecionado !== "all") {
			const statusOption = STATUS_OPTIONS.find(
				(s) => s.value === statusSelecionado,
			);
			subtitle += ` • Filtro: ${statusOption?.label || statusSelecionado}`;
		}
		return subtitle;
	};

	const header = (
		<PageHeader
			title="Solicitações de Material"
			subtitle={obterSubtitle()}
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
				USER_ROLES.ADMIN,
				USER_ROLES.GERENCIA_ALMOXARIFADO,
				USER_ROLES.USUARIO_ALMOXARIFADO,
			]}
		>
			<AdminLayout header={header}>
				<div className="space-y-6">
					{/* Filtros */}
					<Card>
						{/* <CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Filter className="h-5 w-5" />
								Filtros
							</CardTitle>
							<CardDescription>
								Use os filtros abaixo para encontrar solicitações específicas
							</CardDescription>
						</CardHeader> */}
						<CardContent>
							<div className="flex flex-col gap-4 md:flex-row md:items-end">
								<div className="flex-1">
									<label
										htmlFor="busca"
										className="text-sm font-medium mb-2 block"
									>
										Buscar por ID
									</label>
									<div className="relative">
										<Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
										<Input
											id="busca"
											placeholder="Buscar por número da solicitação..."
											value={busca}
											onChange={(e) => setBusca(e.target.value)}
											className="pl-9"
										/>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium mb-2 block">
										Status
									</label>
									<Select
										value={statusSelecionado}
										onValueChange={(value) =>
											setStatusSelecionado(value as StatusSolicitacaoType)
										}
									>
										<SelectTrigger className="w-48">
											<SelectValue placeholder="Todos os status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos os status</SelectItem>
											{STATUS_OPTIONS.map((status) => (
												<SelectItem key={status.value} value={status.value}>
													{status.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<Button
									variant="outline"
									onClick={() => setShowColumnFilters(!showColumnFilters)}
								>
									<Filter className="h-4 w-4 mr-2" />
									{showColumnFilters ? "Ocultar" : "Mostrar"} Filtros por Coluna
								</Button>
								<Button variant="outline" onClick={limparFiltros}>
									Limpar Filtros
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Tabela de Solicitações */}
					<Card>
						<CardHeader>
							<CardTitle>Solicitações</CardTitle>
							<CardDescription>
								{isLoading
									? "Carregando..."
									: `${data?.total || 0} solicitações encontradas`}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<p className="text-muted-foreground">
										Carregando solicitações...
									</p>
								</div>
							) : !data?.solicitacoes.length ? (
								<div className="text-center py-8">
									<ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Nenhuma solicitação encontrada
									</h3>
									<p className="text-muted-foreground mb-4">
										{statusSelecionado && statusSelecionado !== "all"
											? "Tente ajustar os filtros para encontrar solicitações."
											: "Comece criando sua primeira solicitação de material."}
									</p>
									{statusSelecionado === "all" && (
										<Link to="/admin/almoxarifado/solicitacoes/nova">
											<Button>
												<Plus className="h-4 w-4 mr-2" />
												Criar Primeira Solicitação
											</Button>
										</Link>
									)}
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
											{showColumnFilters && (
												<TableRow>
													{table.getHeaderGroups()[0].headers.map((header) => (
														<TableHead
															key={`filter-${header.id}`}
															className="p-2"
														>
															{header.column.getCanFilter() &&
															header.id !== "actions" ? (
																<Input
																	placeholder={`Filtrar ${header.column.columnDef.header}...`}
																	value={
																		(header.column.getFilterValue() as string) ??
																		""
																	}
																	onChange={(event) =>
																		header.column.setFilterValue(
																			event.target.value,
																		)
																	}
																	className="h-8 w-full"
																/>
															) : null}
														</TableHead>
													))}
												</TableRow>
											)}
										</TableHeader>
										<TableBody>
											{table.getRowModel().rows.length ? (
												table.getRowModel().rows.map((row) => (
													<TableRow
														key={row.id}
														data-state={row.getIsSelected() && "selected"}
													>
														{row.getVisibleCells().map((cell) => (
															<TableCell key={cell.id}>
																{flexRender(
																	cell.column.columnDef.cell,
																	cell.getContext(),
																)}
															</TableCell>
														))}
													</TableRow>
												))
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
									{totalPaginas > 1 && (
										<div className="flex items-center justify-between pt-4">
											<div className="flex items-center gap-2">
												<p className="text-sm text-muted-foreground">
													Página {paginaAtual} de {totalPaginas}
												</p>
												<div className="text-sm text-muted-foreground">
													({data?.total || 0} solicitações no total)
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														const novaPagina = Math.max(1, paginaAtual - 1);
														setPaginaAtual(novaPagina);
														navigate({
															to: "/admin/almoxarifado/solicitacoes",
															search: {
																...Route.useSearch(),
																pagina: novaPagina,
															},
														});
													}}
													disabled={paginaAtual === 1}
												>
													Anterior
												</Button>
												<span className="text-sm text-muted-foreground px-2">
													{paginaAtual} / {totalPaginas}
												</span>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														const novaPagina = Math.min(
															totalPaginas,
															paginaAtual + 1,
														);
														setPaginaAtual(novaPagina);
														navigate({
															to: "/admin/almoxarifado/solicitacoes",
															search: {
																...Route.useSearch(),
																pagina: novaPagina,
															},
														});
													}}
													disabled={paginaAtual === totalPaginas}
												>
													Próxima
												</Button>
											</div>
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
