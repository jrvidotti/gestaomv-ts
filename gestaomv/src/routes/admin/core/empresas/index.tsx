import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Building,
	Edit,
	MoreHorizontal,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/empresas/")({
	component: EmpresasListPage,
});

function EmpresasListPage() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
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
				empresa.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
				empresa.nomeFantasia
					?.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				empresa.cnpj.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, "")),
		) || [];

	const handleDelete = (id: string) => {
		if (confirm("Tem certeza que deseja excluir esta empresa?")) {
			removeEmpresa({ id });
		}
	};

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
				<div className="space-y-4">
					{/* Campo de Busca */}
					<Card>
						<CardContent className="pt-6">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Estados de Loading/Erro */}
					{isLoading && (
						<Card>
							<CardContent className="py-8">
								<div className="text-center text-muted-foreground">
									Carregando empresas...
								</div>
							</CardContent>
						</Card>
					)}

					{error && (
						<Card>
							<CardContent className="py-8">
								<div className="text-center text-red-600">
									Erro ao carregar empresas: {error.message}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Tabela de Empresas */}
					{!isLoading && !error && (
						<Card>
							<CardContent className="p-0">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Empresa</TableHead>
											<TableHead>Nome Fantasia</TableHead>
											<TableHead>Unidades</TableHead>
											<TableHead className="w-[100px]">Ações</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredEmpresas.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={4}
													className="text-center py-8 text-muted-foreground"
												>
													{searchTerm
														? "Nenhuma empresa encontrada para a busca"
														: "Nenhuma empresa cadastrada"}
												</TableCell>
											</TableRow>
										) : (
											filteredEmpresas.map((empresa) => (
												<TableRow
													key={empresa.id}
													className="cursor-pointer hover:bg-muted/50"
													onClick={() =>
														navigate({
															to: "/admin/core/empresas/$id/edit",
															params: { id: empresa.id },
														})
													}
												>
													<TableCell>
														<div>
															<div className="font-medium">
																{empresa.razaoSocial}
															</div>
															<div className="text-sm text-muted-foreground">
																CNPJ: {empresa.cnpj}
															</div>
														</div>
													</TableCell>
													<TableCell>{empresa.nomeFantasia || "-"}</TableCell>
													<TableCell>
														<Badge variant="secondary">
															{empresa._count?.unidades || 0} unidade
															{(empresa._count?.unidades || 0) !== 1 ? "s" : ""}
														</Badge>
													</TableCell>
													<TableCell>
														<DropdownMenu>
															<DropdownMenuTrigger
																asChild
																onClick={(e) => e.stopPropagation()}
															>
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
																	onClick={(e) => {
																		e.stopPropagation();
																		handleDelete(empresa.id);
																	}}
																>
																	<Trash2 className="h-4 w-4 mr-2" />
																	Excluir
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					)}
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
