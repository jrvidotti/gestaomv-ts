import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Edit,
	Eye,
	FileText,
	MoreHorizontal,
	Search,
	Trash2,
} from "lucide-react";
import { useState } from "react";

type Cliente = {
	id: number;
	pessoaId: number;
	status: "ativo" | "inativo" | "bloqueado" | "suspenso";
	limiteCredito: number;
	taxaJurosPadrao: number;
	creditoAutorizado: boolean;
	criadoEm: string;
	pessoa: {
		tipoPessoa: "fisica" | "juridica";
		documento: string;
		nomeRazaoSocial: string;
		nomeFantasia?: string | null;
		email?: string | null;
	};
	// Estatísticas de relacionamento
	_count?: {
		operacoes: number;
	};
};

interface ClientesTableProps {
	data: Cliente[];
	isLoading?: boolean;
	onDelete: (id: number) => void;
	onToggleActive?: (id: number, ativo: boolean) => void;
}

const columnHelper = createColumnHelper<Cliente>();

export function ClientesTable({
	data,
	isLoading,
	onDelete,
	onToggleActive,
}: ClientesTableProps) {
	const [globalFilter, setGlobalFilter] = useState("");
	const navigate = useNavigate();

	const formatDocument = (documento: string, tipo: "fisica" | "juridica") => {
		if (tipo === "fisica") {
			return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
		} else {
			return documento.replace(
				/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
				"$1.$2.$3/$4-$5",
			);
		}
	};

	const formatCurrency = (value: number | null) => {
		if (value === null || value === undefined) return "-";
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const handleRowClick = (cliente: Cliente, event: React.MouseEvent) => {
		// Evitar navegação se o clique for na coluna de ações
		if ((event.target as HTMLElement).closest("[data-actions]")) {
			return;
		}

		navigate({
			to: "/admin/factoring/clientes/$id",
			params: { id: cliente.id.toString() },
		});
	};

	const columns = [
		columnHelper.accessor("status", {
			header: "Status",
			cell: (info) => {
				const status = info.getValue();
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
					<Badge variant={variants[status] || "secondary"}>
						{labels[status] || status}
					</Badge>
				);
			},
		}),
		columnHelper.accessor("pessoa.tipoPessoa", {
			header: "Tipo",
			cell: (info) => (
				<Badge variant={info.getValue() === "fisica" ? "outline" : "secondary"}>
					{info.getValue() === "fisica" ? "PF" : "PJ"}
				</Badge>
			),
		}),
		columnHelper.accessor("pessoa.documento", {
			header: "Documento",
			cell: (info) => (
				<div className="font-mono text-sm">
					{formatDocument(info.getValue(), info.row.original.pessoa.tipoPessoa)}
				</div>
			),
		}),
		columnHelper.display({
			id: "nome",
			header: "Nome/Razão Social",
			cell: (info) => {
				const pessoa = info.row.original.pessoa;
				return (
					<div>
						<div className="font-medium">{pessoa.nomeRazaoSocial}</div>
						{pessoa.nomeFantasia && (
							<div className="text-sm text-muted-foreground">
								{pessoa.nomeFantasia}
							</div>
						)}
					</div>
				);
			},
		}),
		columnHelper.accessor("pessoa.email", {
			header: "E-mail",
			cell: (info) => {
				const email = info.getValue();
				return email ? (
					<div className="text-sm">{email}</div>
				) : (
					<span className="text-muted-foreground">-</span>
				);
			},
		}),
		columnHelper.accessor("limiteCredito", {
			header: "Limite de Crédito",
			cell: (info) => (
				<div className="text-sm font-mono">
					{formatCurrency(info.getValue())}
				</div>
			),
		}),
		columnHelper.accessor("taxaJurosPadrao", {
			header: "Taxa Padrão",
			cell: (info) => (
				<div className="text-sm font-mono">{info.getValue()}% a.m.</div>
			),
		}),
		columnHelper.display({
			id: "operacoes",
			header: "Operações",
			cell: (info) => {
				const count = info.row.original._count?.operacoes || 0;
				return (
					<div className="flex items-center gap-1">
						<FileText className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm">{count}</span>
					</div>
				);
			},
		}),
		columnHelper.accessor("criadoEm", {
			header: "Criado em",
			cell: (info) => new Date(info.getValue()).toLocaleDateString("pt-BR"),
		}),
		columnHelper.display({
			id: "actions",
			header: "Ações",
			cell: (info) => {
				const cliente = info.row.original;
				return (
					<div data-actions>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem asChild>
									<Link
										to="/admin/factoring/clientes/$id"
										params={{ id: cliente.id.toString() }}
									>
										<Eye className="h-4 w-4 mr-2" />
										Visualizar
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										to="/admin/factoring/clientes/$id/editar"
										params={{ id: cliente.id.toString() }}
									>
										<Edit className="h-4 w-4 mr-2" />
										Editar
									</Link>
								</DropdownMenuItem>
								{onToggleActive && (
									<DropdownMenuItem
										onClick={() =>
											onToggleActive(cliente.id, cliente.status !== "ativo")
										}
									>
										{cliente.status === "ativo" ? "Desativar" : "Ativar"}
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									className="text-red-600"
									onClick={() => onDelete(cliente.id)}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Excluir
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
		}),
	];

	const table = useReactTable({
		data: data || [],
		columns,
		state: {
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		initialState: {
			pagination: {
				pageSize: 20,
			},
		},
	});

	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="h-12 bg-muted animate-pulse rounded" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Busca */}
			<div className="flex items-center gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Buscar clientes..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Tabela */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="cursor-pointer hover:bg-muted/50"
									onClick={(event) => handleRowClick(row.original, event)}
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
									{globalFilter
										? "Nenhum cliente encontrado para a busca"
										: "Nenhum cliente cadastrado"}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Paginação */}
			{table.getPageCount() > 1 && (
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						Mostrando{" "}
						{table.getState().pagination.pageIndex *
							table.getState().pagination.pageSize +
							1}{" "}
						a{" "}
						{Math.min(
							(table.getState().pagination.pageIndex + 1) *
								table.getState().pagination.pageSize,
							table.getFilteredRowModel().rows.length,
						)}{" "}
						de {table.getFilteredRowModel().rows.length} clientes
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Próximo
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
