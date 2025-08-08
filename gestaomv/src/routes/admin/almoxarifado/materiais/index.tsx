import { RouteGuard } from "@/components/auth/route-guard";
import { DataTable, useDataTable } from "@/components/data-table";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Thumbnail } from "@/components/thumbnail";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ALL_ROLES } from "@/constants";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { filtroMateriaisSchema } from "@/modules/almoxarifado/dtos/materiais";
import type { Material } from "@/modules/almoxarifado/types";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import {
	Eye,
	MoreHorizontal,
	Package,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/almoxarifado/materiais/")({
	component: RouteComponent,
	validateSearch: filtroMateriaisSchema,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { hasAnyRole } = useAuth();
	const filtrosUrl = Route.useSearch();
	const trpc = useTRPC();

	const [busca, setBusca] = useState(filtrosUrl.busca || "");
	const buscaDebounced = useDebounce(busca, 300);

	// Verificar se o usuário pode editar materiais
	const canEditMaterial = hasAnyRole([
		ALL_ROLES.ADMIN,
		ALL_ROLES.ALMOXARIFADO_GERENCIA,
		ALL_ROLES.ALMOXARIFADO_APROVADOR,
	]);

	// Construir filtros usando URL como fonte da verdade
	const filtros = {
		busca: buscaDebounced || undefined,
		tipoMaterialId:
			filtrosUrl.tipoMaterialId && filtrosUrl.tipoMaterialId !== "all"
				? filtrosUrl.tipoMaterialId
				: undefined,
		pagina: filtrosUrl.pagina,
		limite: filtrosUrl.limite,
	};

	const { data, isLoading, refetch } = useQuery(
		trpc.almoxarifado.materiais.listar.queryOptions(filtros),
	);
	const { data: tiposMaterialData } = useQuery(
		trpc.almoxarifado.materiais.listarTiposMaterial.queryOptions(),
	);

	// Configuração do hook de data table
	const dataTable = useDataTable({
		data: data?.materiais || [],
		totalCount: data?.total || 0,
		currentPage: filtrosUrl.pagina,
		currentPageSize: filtrosUrl.limite,
		navigateTo: "/admin/almoxarifado/materiais",
	});

	// Definições de colunas
	const columnHelper = createColumnHelper<Material>();

	const { mutate: inativarMaterial } = useMutation({
		...trpc.almoxarifado.materiais.inativar.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
	});

	const columns = [
		columnHelper.display({
			id: "foto",
			header: "Foto",
			cell: (info) => {
				const material = info.row.original;
				return (
					<Thumbnail
						src={material.foto}
						alt={material.nome}
						size="medium"
						fallbackIcon={Package}
					/>
				);
			},
		}),
		columnHelper.accessor("nome", {
			header: "Nome",
			cell: (info) => {
				const material = info.row.original;
				return (
					<div>
						<p className="font-medium">{material.nome}</p>
						{material.descricao && (
							<p className="text-sm text-muted-foreground">
								{material.descricao}
							</p>
						)}
					</div>
				);
			},
			enableSorting: true,
		}),
		columnHelper.accessor("tipoMaterial", {
			header: "Tipo",
			cell: (info) => <Badge variant="outline">{info.getValue()?.nome}</Badge>,
			enableSorting: true,
			sortingFn: (rowA, rowB) => {
				const nomeA = rowA.original.tipoMaterial?.nome || "";
				const nomeB = rowB.original.tipoMaterial?.nome || "";
				return nomeA.localeCompare(nomeB);
			},
		}),
		columnHelper.accessor("valorUnitario", {
			header: "Valor Unitário",
			cell: (info) => (
				<span className="font-mono">{formatCurrency(info.getValue())}</span>
			),
			enableSorting: true,
		}),
		columnHelper.accessor("unidadeMedida", {
			header: "Unidade",
			cell: (info) => info.getValue()?.nome,
			enableSorting: true,
			sortingFn: (rowA, rowB) => {
				const nomeA = rowA.original.unidadeMedida?.nome || "";
				const nomeB = rowB.original.unidadeMedida?.nome || "";
				return nomeA.localeCompare(nomeB);
			},
		}),
		columnHelper.accessor("ativo", {
			header: "Status",
			cell: (info) => (
				<Badge variant={info.getValue() ? "default" : "secondary"}>
					{info.getValue() ? "Ativo" : "Inativo"}
				</Badge>
			),
			enableSorting: true,
		}),
		columnHelper.display({
			id: "actions",
			header: "Ações",
			cell: (info) => {
				const material = info.row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<Link
								to="/admin/almoxarifado/materiais/$id"
								params={{ id: material.id.toString() }}
							>
								<DropdownMenuItem>
									<Eye className="h-4 w-4 mr-2" />
									Visualizar
								</DropdownMenuItem>
							</Link>
							{canEditMaterial && (
								<Link
									to="/admin/almoxarifado/materiais/$id/edit"
									params={{ id: material.id.toString() }}
								>
									<DropdownMenuItem>
										<Pencil className="h-4 w-4 mr-2" />
										Editar
									</DropdownMenuItem>
								</Link>
							)}
							{material.ativo && canEditMaterial && (
								<DropdownMenuItem
									onClick={() => handleInativar(material.id)}
									className="text-destructive"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Inativar
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		}),
	];

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const handleInativar = async (id: number) => {
		if (confirm("Deseja realmente inativar este material?")) {
			inativarMaterial({ id });
		}
	};

	// Handlers dos filtros

	const handleTipoFilter = (value: string) => {
		navigate({
			to: "/admin/almoxarifado/materiais",
			search: {
				...filtrosUrl,
				tipoMaterialId: value === "all" ? undefined : value,
				pagina: 1,
			},
		});
	};

	const handleRowClick = (material: Material) => {
		navigate({
			to: "/admin/almoxarifado/materiais/$id/edit",
			params: { id: material.id.toString() },
		});
	};

	// Componentes de filtro
	const filtroBusca = (
		<Input
			placeholder="Buscar por nome ou descrição..."
			value={busca}
			onChange={(e) => setBusca(e.target.value)}
			className={cn("h-8 w-full", {
				"bg-accent": filtrosUrl.busca,
			})}
		/>
	);

	const filtroTipo = (
		<Select
			value={filtrosUrl.tipoMaterialId || "all"}
			onValueChange={handleTipoFilter}
		>
			<SelectTrigger
				className={cn("h-8 w-full", {
					"bg-accent":
						filtrosUrl.tipoMaterialId && filtrosUrl.tipoMaterialId !== "all",
				})}
			>
				<SelectValue placeholder="Tipo" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">Todos os tipos</SelectItem>
				{tiposMaterialData?.map((tipo) => (
					<SelectItem key={tipo.id} value={tipo.id.toString()}>
						{tipo.nome}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);

	// Header da página
	const header = (
		<PageHeader
			title="Materiais"
			subtitle="Gerencie o catálogo de materiais do almoxarifado"
			actions={
				canEditMaterial
					? [
							<Link key="novo-material" to="/admin/almoxarifado/materiais/novo">
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									Novo Material
								</Button>
							</Link>,
						]
					: []
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
					<DataTable
						{...dataTable.getTableProps()}
						columns={columns}
						data={data?.materiais || []}
						isLoading={isLoading}
						title="Materiais"
						description={`${data?.total || 0} materiais encontrados`}
						onRowClick={handleRowClick}
						emptyMessage={
							filtrosUrl.busca || filtrosUrl.tipoMaterialId
								? "Nenhum material encontrado com os filtros aplicados."
								: "Nenhum material cadastrado ainda."
						}
						filterComponents={{
							nome: filtroBusca,
							tipoMaterial: filtroTipo,
						}}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
