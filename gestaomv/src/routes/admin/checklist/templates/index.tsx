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
import type { Periodicidade } from "@/modules/checklist/enums";
import type { ChecklistTemplate } from "@/modules/checklist/types";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

// type Template = {
// 	id: number;
// 	nome: string;
// 	descricao?: string | null;
// 	periodicidade: Periodicidade;
// 	ativo: boolean;
// 	criadoEm: string;
// 	_count?: {
// 		itens: number;
// 		avaliacoes: number;
// 	};
// };

const columnHelper = createColumnHelper<ChecklistTemplate>();

export const Route = createFileRoute("/admin/checklist/templates/")({
	component: TemplatesListPage,
});

function TemplatesListPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const header = (
		<PageHeader
			title="Templates de Checklist"
			subtitle="Gerencie os formulários de avaliação para suas unidades"
			actions={[
				<Link key="novo-template" to="/admin/checklist/templates/novo">
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Novo Template
					</Button>
				</Link>,
			]}
		/>
	);

	const [filtros, setFiltros] = useState({
		nome: "",
		ativo: undefined as boolean | undefined,
		periodicidade: undefined as Periodicidade | undefined,
		pagina: 1,
		limite: 20,
	});

	// Query para listar templates
	const { data, isLoading, refetch } = useQuery(
		trpc.checklist.templates.listar.queryOptions(filtros),
	);

	// Mutation para deletar template
	const { mutate: deletarTemplate } = useMutation({
		...trpc.checklist.templates.deletar.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
		onError: (error) => {
			alert(`Erro ao deletar template: ${error.message}`);
		},
	});

	const columns = [
		columnHelper.accessor("nome", {
			header: "Nome",
			cell: (info) => (
				<div>
					<div className="font-medium">{info.getValue()}</div>
					{info.row.original.descricao && (
						<div className="text-sm text-muted-foreground">
							{info.row.original.descricao}
						</div>
					)}
				</div>
			),
		}),
		columnHelper.accessor("periodicidade", {
			header: "Periodicidade",
			cell: (info) => (
				<Badge variant="outline" className="capitalize">
					{info.getValue()}
				</Badge>
			),
		}),
		columnHelper.accessor("ativo", {
			header: "Status",
			cell: (info) => (
				<Badge variant={info.getValue() ? "default" : "secondary"}>
					{info.getValue() ? "Ativo" : "Inativo"}
				</Badge>
			),
		}),
		columnHelper.display({
			id: "estatisticas",
			header: "Estatísticas",
			cell: (info) => (
				<div className="text-sm">
					<div>{info.row.original._count?.itens || 0} itens</div>
					<div className="text-muted-foreground">
						{info.row.original._count?.avaliacoes || 0} avaliações
					</div>
				</div>
			),
		}),
		columnHelper.accessor("criadoEm", {
			header: "Criado em",
			cell: (info) => (
				<div className="text-sm">
					{format(info.getValue() || "", "dd/MM/yyyy")}
				</div>
			),
		}),
		columnHelper.display({
			id: "acoes",
			header: "Ações",
			cell: (info) => (
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							navigate({
								to: "/admin/checklist/templates/$id",
								params: { id: info.row.original.id.toString() },
							})
						}
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							navigate({
								to: "/admin/checklist/templates/$id/edit",
								params: { id: info.row.original.id.toString() },
							})
						}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							if (
								confirm(
									`Deseja realmente inativar o template "${info.row.original.nome}"?`,
								)
							) {
								deletarTemplate({ id: info.row.original.id });
							}
						}}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		}),
	];

	const table = useReactTable({
		data: data?.data || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		refetch();
	};

	return (
		<AdminLayout header={header}>
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Filtros</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSearch} className="flex gap-4 items-end">
							<div className="flex-1">
								<label className="text-sm font-medium mb-2 block">Nome</label>
								<Input
									placeholder="Pesquisar por nome..."
									value={filtros.nome}
									onChange={(e) =>
										setFiltros((prev) => ({ ...prev, nome: e.target.value }))
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">Status</label>
								<Select
									value={filtros.ativo?.toString() || "all"}
									onValueChange={(value) =>
										setFiltros((prev) => ({
											...prev,
											ativo: value === "all" ? undefined : value === "true",
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Todos" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todos</SelectItem>
										<SelectItem value="true">Ativo</SelectItem>
										<SelectItem value="false">Inativo</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">
									Periodicidade
								</label>
								<Select
									value={filtros.periodicidade || "all"}
									onValueChange={(value) =>
										setFiltros((prev) => ({
											...prev,
											periodicidade:
												value === "all"
													? undefined
													: (value as typeof prev.periodicidade),
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Todas" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todas</SelectItem>
										<SelectItem value="semanal">Semanal</SelectItem>
										<SelectItem value="quinzenal">Quinzenal</SelectItem>
										<SelectItem value="mensal">Mensal</SelectItem>
										<SelectItem value="bimestral">Bimestral</SelectItem>
										<SelectItem value="trimestral">Trimestral</SelectItem>
										<SelectItem value="semestral">Semestral</SelectItem>
										<SelectItem value="anual">Anual</SelectItem>
										<SelectItem value="unica">Única</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Button type="submit">
								<Search className="w-4 h-4 mr-2" />
								Buscar
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-0">
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
								{isLoading ? (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											Carregando...
										</TableCell>
									</TableRow>
								) : table.getRowModel().rows?.length ? (
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
											Nenhum template encontrado.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{data && data.totalPaginas > 1 && (
					<div className="flex justify-center space-x-2">
						{Array.from({ length: data.totalPaginas }, (_, i) => i + 1).map(
							(page) => (
								<Button
									key={page}
									variant={page === filtros.pagina ? "default" : "outline"}
									size="sm"
									onClick={() =>
										setFiltros((prev) => ({ ...prev, pagina: page }))
									}
								>
									{page}
								</Button>
							),
						)}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
