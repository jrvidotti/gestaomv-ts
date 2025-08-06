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
import { USER_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Edit,
	MapPin,
	MoreHorizontal,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/unidades/")({
	component: UnidadesListPage,
});

function UnidadesListPage() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	const trpc = useTRPC();

	// Queries tRPC
	const {
		data: unidades,
		isLoading,
		error,
		refetch,
	} = useQuery(trpc.unidades.findAll.queryOptions());
	const { mutate: removeUnidade } = useMutation({
		...trpc.unidades.remove.mutationOptions(),
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
				unidade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
				unidade.codigo.toString().includes(searchTerm) ||
				unidade.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				unidade.empresa?.razaoSocial
					?.toLowerCase()
					.includes(searchTerm.toLowerCase()),
		) || [];

	const handleDelete = (id: string) => {
		if (confirm("Tem certeza que deseja excluir esta unidade?")) {
			removeUnidade({ id });
		}
	};

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
		<RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="space-y-4">
					{/* Campo de Busca */}
					<Card>
						<CardContent className="pt-6">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Buscar por nome, código ou cidade..."
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
									Carregando unidades...
								</div>
							</CardContent>
						</Card>
					)}

					{error && (
						<Card>
							<CardContent className="py-8">
								<div className="text-center text-red-600">
									Erro ao carregar unidades: {error.message}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Tabela de Unidades */}
					{!isLoading && !error && (
						<Card>
							<CardContent className="p-0">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Nome</TableHead>
											<TableHead>Código</TableHead>
											<TableHead>PontoWeb ID</TableHead>
											<TableHead>Localização</TableHead>
											<TableHead className="w-[100px]">Ações</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredUnidades.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={5}
													className="text-center py-8 text-muted-foreground"
												>
													{searchTerm
														? "Nenhuma unidade encontrada para a busca"
														: "Nenhuma unidade cadastrada"}
												</TableCell>
											</TableRow>
										) : (
											filteredUnidades.map((unidade) => (
												<TableRow
													key={unidade.id}
													className="cursor-pointer hover:bg-muted/50"
													onClick={() =>
														navigate({
															to: "/admin/core/unidades/$id/edit",
															params: { id: unidade.id },
														})
													}
												>
													<TableCell>
														<div>
															<div className="font-medium">{unidade.nome}</div>
															{unidade.empresa && (
																<div className="text-sm text-muted-foreground">
																	{unidade.empresa.razaoSocial}
																</div>
															)}
														</div>
													</TableCell>
													<TableCell>
														<Badge variant="outline">{unidade.codigo}</Badge>
													</TableCell>
													<TableCell>
														{unidade.pontowebId ? (
															<Badge variant="secondary">
																{unidade.pontowebId}
															</Badge>
														) : (
															<span className="text-muted-foreground">-</span>
														)}
													</TableCell>
													<TableCell>
														{unidade.cidade ? (
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
														)}
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
																		to="/admin/core/unidades/$id/edit"
																		params={{ id: unidade.id }}
																	>
																		<Edit className="h-4 w-4 mr-2" />
																		Editar
																	</Link>
																</DropdownMenuItem>
																<DropdownMenuItem
																	className="text-red-600"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleDelete(unidade.id);
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
