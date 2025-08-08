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
import { Link } from "@tanstack/react-router";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Edit, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useState } from "react";

type Carteira = {
	id: number;
	nome: string;
	banco: string;
	agencia: string;
	conta: string;
	chavePix: string | null;
	criadoEm: string;
	userName: string;
};

interface CarteirasTableProps {
	data: Carteira[];
	isLoading?: boolean;
	onDelete: (id: number) => void;
}

const columnHelper = createColumnHelper<Carteira>();

export function CarteirasTable({
	data,
	isLoading,
	onDelete,
}: CarteirasTableProps) {
	const [globalFilter, setGlobalFilter] = useState("");

	const columns = [
		columnHelper.accessor("nome", {
			header: "Nome",
			cell: (info) => <div className="font-medium">{info.getValue()}</div>,
		}),
		columnHelper.accessor("banco", {
			header: "Banco",
			cell: (info) => info.getValue(),
		}),
		columnHelper.display({
			id: "conta",
			header: "Agência/Conta",
			cell: (info) => (
				<div className="font-mono text-sm">
					{info.row.original.agencia}/{info.row.original.conta}
				</div>
			),
		}),
		columnHelper.accessor("chavePix", {
			header: "PIX",
			cell: (info) => {
				const pix = info.getValue();
				return pix ? (
					<Badge variant="outline" className="font-mono text-xs">
						{pix.length > 20 ? `${pix.substring(0, 20)}...` : pix}
					</Badge>
				) : (
					<span className="text-muted-foreground">-</span>
				);
			},
		}),
		columnHelper.accessor("userName", {
			header: "Usuário",
			cell: (info) => (
				<div className="text-sm text-muted-foreground">{info.getValue()}</div>
			),
		}),
		columnHelper.accessor("criadoEm", {
			header: "Criado em",
			cell: (info) => new Date(info.getValue()).toLocaleDateString("pt-BR"),
		}),
		columnHelper.display({
			id: "actions",
			header: "Ações",
			cell: (info) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link
								to="/admin/factoring/carteiras/$id/editar"
								params={{ id: info.row.original.id.toString() }}
							>
								<Edit className="h-4 w-4 mr-2" />
								Editar
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-red-600"
							onClick={() => onDelete(info.row.original.id)}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Excluir
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
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
						placeholder="Buscar carteiras..."
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
								<TableRow key={row.id}>
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
										? "Nenhuma carteira encontrada para a busca"
										: "Nenhuma carteira cadastrada"}
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
						de {table.getFilteredRowModel().rows.length} carteiras
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
