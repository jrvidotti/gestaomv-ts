import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { MultipleRoleBadges } from "@/components/role-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
	Edit,
	MoreHorizontal,
	Plus,
	Search,
	Trash2,
	UserCheck,
	UserX,
	Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/users/")({
	component: UsersListPage,
});

function UsersListPage() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	const trpc = useTRPC();

	// Queries tRPC
	const {
		data: users,
		isLoading,
		error,
		refetch,
	} = useQuery(trpc.core.users.listar.queryOptions());
	const { mutate: updateUser } = useMutation({
		...trpc.core.users.atualizar.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
	});
	const { mutate: removeUser } = useMutation({
		...trpc.core.users.deletar.mutationOptions(),
		onSuccess: () => {
			toast.success("Usuário removido com sucesso!");
			refetch();
		},
		onError: (error) => {
			toast.error(`Erro ao remover usuário: ${error.message}`);
		},
	});

	// Filtrar usuários baseado na busca
	const filteredUsers =
		users?.filter(
			(user) =>
				user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	const handleToggleStatus = (id: string, currentStatus: boolean) => {
		updateUser(
			{
				id,
				isActive: !currentStatus,
			},
			{
				onSuccess: () => {
					toast.success(
						`Usuário ${!currentStatus ? "ativado" : "desativado"} com sucesso!`,
					);
				},
				onError: () => {
					toast.error(
						`Erro ao ${!currentStatus ? "ativar" : "desativar"} usuário`,
					);
				},
			},
		);
	};

	const handleDelete = (id: string) => {
		if (
			confirm(
				"Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.",
			)
		) {
			removeUser({ id });
		}
	};

	const header = (
		<PageHeader
			title="Gerenciamento de Usuários"
			subtitle="Visualizar e gerenciar todos os usuários do sistema"
			icon={<Users className="h-5 w-5" />}
			actions={[
				<Button key="new-user" asChild>
					<Link to="/admin/core/users/novo">
						<Plus className="h-4 w-4 mr-2" />
						Novo Usuário
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
									placeholder="Buscar por nome ou email..."
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
									Carregando usuários...
								</div>
							</CardContent>
						</Card>
					)}

					{error && (
						<Card>
							<CardContent className="py-8">
								<div className="text-center text-red-600">
									Erro ao carregar usuários: {error.message}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Tabela de Usuários */}
					{!isLoading && !error && (
						<Card>
							<CardContent className="p-0">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Usuário</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Função</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Data de Criação</TableHead>
											<TableHead className="w-[100px]">Ações</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredUsers.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan={6}
													className="text-center py-8 text-muted-foreground"
												>
													{searchTerm
														? "Nenhum usuário encontrado para a busca"
														: "Nenhum usuário cadastrado"}
												</TableCell>
											</TableRow>
										) : (
											filteredUsers.map((user) => (
												<TableRow
													key={user.id}
													className="cursor-pointer hover:bg-muted/50"
													onClick={() =>
														navigate({
															to: "/admin/core/users/$id/edit",
															params: { id: user.id },
														})
													}
												>
													<TableCell>
														<div className="flex items-center gap-3">
															<Avatar className="h-8 w-8">
																<AvatarImage
																	src={`https://avatar.vercel.sh/${user.email}`}
																/>
																<AvatarFallback>
																	{user.name
																		.split(" ")
																		.map((n) => n[0])
																		.join("")
																		.toUpperCase()}
																</AvatarFallback>
															</Avatar>
															<span className="font-medium">{user.name}</span>
														</div>
													</TableCell>
													<TableCell>{user.email}</TableCell>
													<TableCell>
														<MultipleRoleBadges
															roles={user.roles}
															maxDisplay={2}
														/>
													</TableCell>
													<TableCell>
														<Badge
															variant={user.isActive ? "default" : "secondary"}
														>
															{user.isActive ? "Ativo" : "Inativo"}
														</Badge>
													</TableCell>
													<TableCell>
														{new Date(user.createdAt).toLocaleDateString(
															"pt-BR",
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
																		to="/admin/core/users/$id/edit"
																		params={{ id: user.id }}
																	>
																		<Edit className="h-4 w-4 mr-2" />
																		Editar
																	</Link>
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		handleToggleStatus(user.id, user.isActive);
																	}}
																>
																	{user.isActive ? (
																		<>
																			<UserX className="h-4 w-4 mr-2" />
																			Desativar
																		</>
																	) : (
																		<>
																			<UserCheck className="h-4 w-4 mr-2" />
																			Ativar
																		</>
																	)}
																</DropdownMenuItem>
																<DropdownMenuItem
																	className="text-red-600"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleDelete(user.id);
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
