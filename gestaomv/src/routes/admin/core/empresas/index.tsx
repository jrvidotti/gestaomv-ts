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
import { Building, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/empresas/")({
	component: EmpresasListPage,
});

// Tipo para a empresa
type Empresa = {
	id: string;
	razaoSocial: string;
	nomeFantasia?: string;
	cnpj: string;
	_count?: {
		unidades: number;
	};
};

function EmpresasListPage() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const searchDebounced = useDebounce(searchTerm, 300);
	const trpc = useTRPC();

	// Queries tRPC
	const {
		data: empresas,
		isLoading,
		error,
		refetch,
	} = useQuery(trpc.empresas.listar.queryOptions());
	const { mutate: removeEmpresa } = useMutation({
		...trpc.empresas.deletar.mutationOptions(),
		onSuccess: () => {
			toast.success("Empresa removida com sucesso!");
			refetch();
		},
		onError: (error) => {
			toast.error(`Erro ao remover empresa: ${error.message}`);
		},
	});

	// Filtrar empresas baseado na busca
	const filteredEmpresas =
		empresas?.filter(
			(empresa) =>
				empresa.razaoSocial
					.toLowerCase()
					.includes(searchDebounced.toLowerCase()) ||
				empresa.nomeFantasia
					?.toLowerCase()
					.includes(searchDebounced.toLowerCase()) ||
				empresa.cnpj
					.replace(/\D/g, "")
					.includes(searchDebounced.replace(/\D/g, "")),
		) || [];

	// Configuração do hook de data table
	const dataTable = useDataTable({
		data: filteredEmpresas,
		totalCount: filteredEmpresas.length,
		currentPage: 1,
		currentPageSize: 20,
	});

	// Definições de colunas
	const columnHelper = createColumnHelper<Empresa>();

	const columns = [
		columnHelper.accessor("razaoSocial", {
			header: "Empresa",
			cell: (info) => {
				const empresa = info.row.original;
				return (
					<div>
						<div className="font-medium">{empresa.razaoSocial}</div>
						<div className="text-sm text-muted-foreground">
							CNPJ: {empresa.cnpj}
						</div>
					</div>
				);
			},
			enableSorting: true,
		}),
		columnHelper.accessor("nomeFantasia", {
			header: "Nome Fantasia",
			cell: (info) => info.getValue() || "-",
			enableSorting: true,
		}),
		columnHelper.display({
			id: "unidades",
			header: "Unidades",
			cell: (info) => {
				const empresa = info.row.original;
				const count = empresa._count?.unidades || 0;
				return (
					<Badge variant="secondary">
						{count} unidade{count !== 1 ? "s" : ""}
					</Badge>
				);
			},
		}),
		columnHelper.display({
			id: "actions",
			header: "Ações",
			cell: (info) => {
				const empresa = info.row.original;
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
									to="/admin/core/empresas/$id/edit"
									params={{ id: empresa.id }}
								>
									<Edit className="h-4 w-4 mr-2" />
									Editar
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-red-600"
								onClick={() => handleDelete(empresa.id)}
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
		if (confirm("Tem certeza que deseja excluir esta empresa?")) {
			removeEmpresa({ id });
		}
	};

	const handleRowClick = (empresa: Empresa) => {
		navigate({
			to: "/admin/core/empresas/$id/edit",
			params: { id: empresa.id },
		});
	};

	// Componente de filtro
	const filtroNome = (
		<Input
			placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
			value={searchTerm}
			onChange={(e) => setSearchTerm(e.target.value)}
			className="h-8 w-full"
		/>
	);

	const header = (
		<PageHeader
			title="Gerenciamento de Empresas"
			subtitle="Visualizar e gerenciar todas as empresas cadastradas"
			icon={<Building className="h-5 w-5" />}
			actions={[
				<Button key="new-empresa" asChild>
					<Link to="/admin/core/empresas/nova">
						<Plus className="h-4 w-4 mr-2" />
						Nova Empresa
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
						data={filteredEmpresas}
						isLoading={isLoading}
						error={error}
						title="Empresas"
						description={`${filteredEmpresas.length} empresas encontradas`}
						onRowClick={handleRowClick}
						emptyMessage={
							searchTerm
								? "Nenhuma empresa encontrada para a busca"
								: "Nenhuma empresa cadastrada"
						}
						filterComponents={{
							razaoSocial: filtroNome,
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
