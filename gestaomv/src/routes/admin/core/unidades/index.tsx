import { RouteGuard } from "@/components/auth/route-guard";
import { DataTable, useDataTable } from "@/components/data-table";
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
import { Input } from "@/components/ui/input";
import { ALL_ROLES } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { Edit, MapPin, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/unidades/")({
	component: UnidadesListPage,
});

// Tipo para a unidade
type Unidade = {
	id: string;
	nome: string;
	codigo: number;
	pontowebId?: string;
	cidade?: string;
	estado?: string;
	empresa?: {
		razaoSocial: string;
	};
};

function UnidadesListPage() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const searchDebounced = useDebounce(searchTerm, 300);

	const trpc = useTRPC();

	// Queries tRPC
	const {
		data: unidades,
		isLoading,
		error,
		refetch,
	} = useQuery(trpc.unidades.listar.queryOptions());
	const { mutate: removeUnidade } = useMutation({
		...trpc.unidades.deletar.mutationOptions(),
		onSuccess: () => {
			toast.success("Unidade removida com sucesso!");
			refetch();
		},
		onError: (error) => {
			toast.error(`Erro ao remover unidade: ${error.message}`);
		},
	});

	// Filtrar unidades baseado na busca
	const filteredUnidades =
		unidades?.filter(
			(unidade) =>
				unidade.nome.toLowerCase().includes(searchDebounced.toLowerCase()) ||
				unidade.codigo.toString().includes(searchDebounced) ||
				unidade.cidade?.toLowerCase().includes(searchDebounced.toLowerCase()) ||
				unidade.empresa?.razaoSocial
					?.toLowerCase()
					.includes(searchDebounced.toLowerCase()),
		) || [];

	// Configuração do hook de data table
	const dataTable = useDataTable({
		data: filteredUnidades,
		totalCount: filteredUnidades.length,
		currentPage: 1,
		currentPageSize: 20,
	});

	// Definições de colunas
	const columnHelper = createColumnHelper<Unidade>();

	const columns = [
		columnHelper.accessor("nome", {
			header: "Nome",
			cell: (info) => {
				const unidade = info.row.original;
				return (
					<div>
						<div className="font-medium">{unidade.nome}</div>
						{unidade.empresa && (
							<div className="text-sm text-muted-foreground">
								{unidade.empresa.razaoSocial}
							</div>
						)}
					</div>
				);
			},
			enableSorting: true,
		}),
		columnHelper.accessor("codigo", {
			header: "Código",
			cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
			enableSorting: true,
		}),
		columnHelper.accessor("pontowebId", {
			header: "PontoWeb ID",
			cell: (info) => {
				const pontowebId = info.getValue();
				return pontowebId ? (
					<Badge variant="secondary">{pontowebId}</Badge>
				) : (
					<span className="text-muted-foreground">-</span>
				);
			},
			enableSorting: true,
		}),
		columnHelper.display({
			id: "localizacao",
			header: "Localização",
			cell: (info) => {
				const unidade = info.row.original;
				return unidade.cidade ? (
					<div>
						<div>{unidade.cidade}</div>
						{unidade.estado && (
							<div className="text-sm text-muted-foreground">
								{unidade.estado}
							</div>
						)}
					</div>
				) : (
					<span className="text-muted-foreground">-</span>
				);
			},
		}),
		columnHelper.display({
			id: "actions",
			header: "Ações",
			cell: (info) => {
				const unidade = info.row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link
									to="/admin/core/unidades/$id/edit"
									params={{ id: unidade.id }}
								>
									<Edit className="h-4 w-4 mr-2" />
									Editar
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-red-600"
								onClick={() => handleDelete(unidade.id)}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Excluir
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		}),
	];

	const handleDelete = (id: string) => {
		if (confirm("Tem certeza que deseja excluir esta unidade?")) {
			removeUnidade({ id });
		}
	};

	const handleRowClick = (unidade: Unidade) => {
		navigate({
			to: "/admin/core/unidades/$id/edit",
			params: { id: unidade.id },
		});
	};

	// Componente de filtro
	const filtroNome = (
		<Input
			placeholder="Buscar por nome, código ou cidade..."
			value={searchTerm}
			onChange={(e) => setSearchTerm(e.target.value)}
			className="h-8 w-full"
		/>
	);

	const header = (
		<PageHeader
			title="Gerenciamento de Unidades"
			subtitle="Visualizar e gerenciar todas as unidades cadastradas"
			icon={<MapPin className="h-5 w-5" />}
			actions={[
				<Button key="new-unidade" asChild>
					<Link to="/admin/core/unidades/nova">
						<Plus className="h-4 w-4 mr-2" />
						Nova Unidade
					</Link>
				</Button>,
			]}
		/>
	);

	return (
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="space-y-6">
					<DataTable
						{...dataTable.getTableProps()}
						columns={columns}
						data={filteredUnidades}
						isLoading={isLoading}
						error={error}
						title="Unidades"
						description={`${filteredUnidades.length} unidades encontradas`}
						onRowClick={handleRowClick}
						emptyMessage={
							searchTerm
								? "Nenhuma unidade encontrada para a busca"
								: "Nenhuma unidade cadastrada"
						}
						filterComponents={{
							nome: filtroNome,
						}}
						manualPagination={false}
						manualSorting={false}
						manualFiltering={false}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
