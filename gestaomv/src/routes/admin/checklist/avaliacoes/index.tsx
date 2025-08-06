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
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

type Avaliacao = {
	id: number;
	status: string;
	dataAgendada?: string | null;
	dataInicio?: string | null;
	dataFim?: string | null;
	mediaFinal?: number | null;
	classificacao?: string | null;
	criadoEm: string;
	template: {
		nome: string;
	};
	unidade: {
		nome: string;
	};
	avaliador: {
		name: string;
	};
};

const columnHelper = createColumnHelper<Avaliacao>();

export const Route = createFileRoute("/admin/checklist/avaliacoes/")({
	component: AvaliacoesListPage,
});

function AvaliacoesListPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const header = (
		<PageHeader
			title="Avaliações de Checklist"
			subtitle="Acompanhe e gerencie as avaliações realizadas nas unidades"
			actions={[
				<Link key="nova-avaliacao" to="/admin/checklist/avaliacoes/nova">
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Nova Avaliação
					</Button>
				</Link>,
			]}
		/>
	);

	const [filtros, setFiltros] = useState({
		status: "",
		classificacao: "",
		dataInicio: "",
		dataFim: "",
		pagina: 1,
		limite: 20,
	});

	// Query para listar avaliações
	const { data, isLoading, refetch } = useQuery(
		trpc.checklist.avaliacoes.listar.queryOptions(filtros),
	);

	// Mutation para deletar avaliação
	const { mutate: deletarAvaliacao } = useMutation({
		...trpc.checklist.avaliacoes.deletar.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
		onError: (error) => {
			alert(`Erro ao deletar avaliação: ${error.message}`);
		},
	});

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "concluida":
				return "default";
			case "em_andamento":
				return "secondary";
			case "pendente":
				return "outline";
			case "cancelada":
				return "destructive";
			default:
				return "outline";
		}
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

	const columns = [
		columnHelper.accessor("template.nome", {
			header: "Template",
			cell: (info) => <div className="font-medium">{info.getValue()}</div>,
		}),
		columnHelper.accessor("unidade.nome", {
			header: "Unidade",
			cell: (info) => <div className="font-medium">{info.getValue()}</div>,
		}),
		columnHelper.accessor("avaliador.name", {
			header: "Avaliador",
			cell: (info) => <div className="text-sm">{info.getValue()}</div>,
		}),
		columnHelper.accessor("status", {
			header: "Status",
			cell: (info) => (
				<Badge
					variant={getStatusBadgeVariant(info.getValue())}
					className="capitalize"
				>
					{info.getValue().replace("_", " ")}
				</Badge>
			),
		}),
		columnHelper.accessor("mediaFinal", {
			header: "Nota Final",
			cell: (info) => {
				const media = info.getValue();
				const classificacao = info.row.original.classificacao;

				if (media === null || media === undefined) {
					return <span className="text-muted-foreground">-</span>;
				}

				return (
					<div className="text-center">
						<div className="font-bold text-lg">{media.toFixed(1)}</div>
						{classificacao && (
							<Badge
								variant={getClassificacaoBadgeVariant(classificacao)}
								className="text-xs capitalize"
							>
								{classificacao}
							</Badge>
						)}
					</div>
				);
			},
		}),
		columnHelper.accessor("criadoEm", {
			header: "Data de Criação",
			cell: (info) => (
				<div className="text-sm">
					{new Date(info.getValue()).toLocaleDateString("pt-BR")}
				</div>
			),
		}),
		columnHelper.display({
			id: "datas",
			header: "Datas",
			cell: (info) => {
				const avaliacao = info.row.original;
				return (
					<div className="text-sm space-y-1">
						{avaliacao.dataAgendada && (
							<div>
								<span className="font-medium">Agendada:</span>{" "}
								{new Date(avaliacao.dataAgendada).toLocaleDateString("pt-BR")}
							</div>
						)}
						{avaliacao.dataInicio && (
							<div>
								<span className="font-medium">Iniciada:</span>{" "}
								{new Date(avaliacao.dataInicio).toLocaleDateString("pt-BR")}
							</div>
						)}
						{avaliacao.dataFim && (
							<div>
								<span className="font-medium">Finalizada:</span>{" "}
								{new Date(avaliacao.dataFim).toLocaleDateString("pt-BR")}
							</div>
						)}
					</div>
				);
			},
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
								to: "/admin/checklist/avaliacoes/$id",
								params: { id: info.row.original.id.toString() },
							})
						}
					>
						<Eye className="h-4 w-4" />
					</Button>
					{info.row.original.status !== "concluida" && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								navigate({
									to: "/admin/checklist/avaliacoes/$id/edit",
									params: { id: info.row.original.id.toString() },
								})
							}
						>
							<Edit className="h-4 w-4" />
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							if (confirm("Deseja realmente deletar esta avaliação?")) {
								deletarAvaliacao({ id: info.row.original.id });
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
							<div>
								<label className="text-sm font-medium mb-2 block">Status</label>
								<Select
									value={filtros.status || "all"}
									onValueChange={(value) =>
										setFiltros((prev) => ({
											...prev,
											status: value === "all" ? "" : value,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Todos" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todos</SelectItem>
										<SelectItem value="pendente">Pendente</SelectItem>
										<SelectItem value="em_andamento">Em Andamento</SelectItem>
										<SelectItem value="concluida">Concluída</SelectItem>
										<SelectItem value="cancelada">Cancelada</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">
									Classificação
								</label>
								<Select
									value={filtros.classificacao || "all"}
									onValueChange={(value) =>
										setFiltros((prev) => ({
											...prev,
											classificacao: value === "all" ? "" : value,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Todas" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todas</SelectItem>
										<SelectItem value="excelente">Excelente</SelectItem>
										<SelectItem value="bom">Bom</SelectItem>
										<SelectItem value="regular">Regular</SelectItem>
										<SelectItem value="ruim">Ruim</SelectItem>
										<SelectItem value="pessimo">Péssimo</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">
									Data Início
								</label>
								<Input
									type="date"
									value={filtros.dataInicio}
									onChange={(e) =>
										setFiltros((prev) => ({
											...prev,
											dataInicio: e.target.value,
										}))
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">
									Data Fim
								</label>
								<Input
									type="date"
									value={filtros.dataFim}
									onChange={(e) =>
										setFiltros((prev) => ({ ...prev, dataFim: e.target.value }))
									}
								/>
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
											Nenhuma avaliação encontrada.
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
