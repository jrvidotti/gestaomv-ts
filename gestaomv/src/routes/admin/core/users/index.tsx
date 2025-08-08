import { RouteGuard } from "@/components/auth/route-guard";
import { DataTable, useDataTable } from "@/components/data-table";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { MultipleRoleBadges } from "@/components/role-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ALL_ROLES, ALL_ROLES_DATA } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { filtroUsuariosSchema } from "@/modules/core/dtos";
import type { UserWithoutPassword } from "@/modules/core/types";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import {
	Edit,
	MoreHorizontal,
	Plus,
	Trash2,
	UserCheck,
	UserX,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/users/")({
	component: UsersListPage,
	validateSearch: filtroUsuariosSchema,
});

// Tipo para o usuário - usando o tipo do backend
type User = UserWithoutPassword;

// Definir colunas fora do componente para evitar recriações
const createUserColumns = () => {
	const columnHelper = createColumnHelper<User>();
	return [
		columnHelper.accessor("name", {
			header: "Usuário",
			cell: (info) => {
				const user = info.row.original;
				return (
					<div className="flex items-center gap-3">
						<Avatar className="h-8 w-8">
							<AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
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
				);
			},
			enableSorting: true,
		}),
		columnHelper.accessor("email", {
			header: "Email",
			enableSorting: true,
		}),
		columnHelper.accessor("roles", {
			header: "Função",
			cell: (info) => (
				<MultipleRoleBadges roles={info.getValue()} maxDisplay={2} />
			),
		}),
		columnHelper.accessor("isActive", {
			header: "Status",
			cell: (info) => (
				<Badge variant={info.getValue() ? "default" : "secondary"}>
					{info.getValue() ? "Ativo" : "Inativo"}
				</Badge>
			),
			enableSorting: true,
		}),
		columnHelper.accessor("createdAt", {
			header: "Data de Criação",
			cell: (info) => {
				const date = info.getValue();
				return date ? new Date(date).toLocaleDateString("pt-BR") : "-";
			},
			enableSorting: true,
		}),
		columnHelper.display({
			id: "actions",
			header: "Ações",
			cell: () => (
				<UserActionsMenu
					user={{} as User}
					onToggleStatus={() => {}}
					onDelete={() => {}}
				/>
			),
		}),
	];
};

// Componente para o menu de ações do usuário
const UserActionsMenu = ({
	user,
	onToggleStatus,
	onDelete,
}: {
	user: User;
	onToggleStatus: (id: number, currentStatus: boolean) => void;
	onDelete: (id: number) => void;
}) => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="ghost" size="sm">
				<MoreHorizontal className="h-4 w-4" />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuItem asChild>
				<Link
					to="/admin/core/users/$id/edit"
					params={{ id: user.id.toString() }}
				>
					<Edit className="h-4 w-4 mr-2" />
					Editar
				</Link>
			</DropdownMenuItem>
			<DropdownMenuItem onClick={() => onToggleStatus(user.id, user.isActive)}>
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
				onClick={() => onDelete(user.id)}
			>
				<Trash2 className="h-4 w-4 mr-2" />
				Excluir
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

function UsersListPage() {
	const navigate = useNavigate();
	const filtrosUrl = Route.useSearch();
	const trpc = useTRPC();

	const [nome, setNome] = useState(filtrosUrl.nome || "");
	const [email, setEmail] = useState(filtrosUrl.email || "");
	const nomeDebounced = useDebounce(nome, 300);
	const emailDebounced = useDebounce(email, 300);

	// Efeito para detectar e corrigir URLs corrompidas
	useEffect(() => {
		const hasInvalidRoles = filtrosUrl.roles?.some(
			(role) =>
				!role ||
				role === null ||
				role === "null" ||
				!Object.values(ALL_ROLES).includes(role as any),
		);

		if (hasInvalidRoles) {
			// Redirecionar para URL limpa
			navigate({
				to: "/admin/core/users",
				search: {
					...filtrosUrl,
					roles: undefined,
					pagina: 1,
				},
				replace: true, // Substituir histórico para não voltar à URL corrompida
			});
		}
	}, [filtrosUrl.roles, navigate, filtrosUrl]);

	// Construir filtros usando URL como fonte da verdade
	const filtros = {
		nome: nomeDebounced || undefined,
		email: emailDebounced || undefined,
		status: filtrosUrl.status || undefined,
		roles: filtrosUrl.roles || undefined,
		pagina: filtrosUrl.pagina,
		limite: filtrosUrl.limite,
	};

	// Queries tRPC
	const { data, isLoading, error, refetch } = useQuery(
		trpc.users.listar.queryOptions(filtros),
	);

	const { mutate: updateUser } = useMutation({
		...trpc.users.atualizar.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
	});

	const { mutate: removeUser } = useMutation({
		...trpc.users.deletar.mutationOptions(),
		onSuccess: () => {
			toast.success("Usuário removido com sucesso!");
			refetch();
		},
		onError: (error) => {
			toast.error(`Erro ao remover usuário: ${error.message}`);
		},
	});

	// Memoizar handlers para evitar recriações
	const handleToggleStatus = useCallback(
		(id: number, currentStatus: boolean) => {
			updateUser(
				{
					id,
					data: {
						isActive: !currentStatus,
					},
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
		},
		[updateUser],
	);

	const handleDelete = useCallback(
		(id: number) => {
			if (
				confirm(
					"Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.",
				)
			) {
				removeUser({ id });
			}
		},
		[removeUser],
	);

	const handleRowClick = useCallback(
		(user: User) => {
			navigate({
				to: "/admin/core/users/$id/edit",
				params: { id: user.id.toString() },
			});
		},
		[navigate],
	);

	// Criar colunas com handlers memoizados
	const columns = useMemo(() => {
		const baseColumns = createUserColumns();
		// Atualizar a coluna de ações com os handlers corretos
		const actionsColumn = baseColumns.find((col) => col.id === "actions");
		if (actionsColumn) {
			actionsColumn.cell = (info: any) => {
				const user = info.row.original;
				return (
					<UserActionsMenu
						user={user}
						onToggleStatus={handleToggleStatus}
						onDelete={handleDelete}
					/>
				);
			};
		}
		return baseColumns;
	}, [handleToggleStatus, handleDelete]);

	// Configuração do hook de data table
	const dataTable = useDataTable({
		data: data?.usuarios || [],
		totalCount: data?.total || 0,
		currentPage: filtrosUrl.pagina,
		currentPageSize: filtrosUrl.limite,
		navigateTo: "/admin/core/users",
	});

	// Componentes de filtro
	const filtroNome = (
		<Input
			placeholder="Buscar por nome..."
			value={nome}
			onChange={(e) => setNome(e.target.value)}
			className={cn("h-8 w-full", {
				"bg-accent": filtrosUrl.nome,
			})}
		/>
	);

	const filtroEmail = (
		<Input
			placeholder="Buscar por email..."
			value={email}
			onChange={(e) => setEmail(e.target.value)}
			className={cn("h-8 w-full", {
				"bg-accent": filtrosUrl.email,
			})}
		/>
	);

	const filtroStatus = (
		<Select
			value={filtrosUrl.status || "todos"}
			onValueChange={(value: "todos" | "ativo" | "inativo") => {
				const newStatus = value === "todos" ? undefined : value;
				navigate({
					to: "/admin/core/users",
					search: { ...filtrosUrl, status: newStatus, pagina: 1 },
				});
			}}
		>
			<SelectTrigger
				className={cn("h-8 w-full", {
					"bg-accent": filtrosUrl.status && filtrosUrl.status !== "todos",
				})}
			>
				<SelectValue placeholder="Status" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="todos">Todos</SelectItem>
				<SelectItem value="ativo">Ativo</SelectItem>
				<SelectItem value="inativo">Inativo</SelectItem>
			</SelectContent>
		</Select>
	);

	const filtroFuncao = (
		<Select
			value={filtrosUrl.roles?.[0] || "todos"}
			onValueChange={(value) => {
				const newRoles = value === "todos" || !value ? undefined : [value];
				navigate({
					to: "/admin/core/users",
					search: { ...filtrosUrl, roles: newRoles, pagina: 1 },
				});
			}}
		>
			<SelectTrigger
				className={cn("h-8 w-full", {
					"bg-accent": filtrosUrl.roles && filtrosUrl.roles.length > 0,
				})}
			>
				<SelectValue placeholder="Função" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="todos">Todas</SelectItem>
				{Object.values(ALL_ROLES).map((role) => {
					const roleData = Object.values(ALL_ROLES_DATA).find(
						(data) => data.value === role,
					);
					return (
						<SelectItem key={role} value={role}>
							{roleData?.label || role}
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);

	// Função para limpar filtros
	const handleClearFilters = useCallback(() => {
		setNome("");
		setEmail("");
		navigate({
			to: "/admin/core/users",
			search: {
				pagina: 1,
				limite: filtrosUrl.limite,
				// Limpar explicitamente todos os outros filtros
				nome: undefined,
				email: undefined,
				status: undefined,
				roles: undefined,
			},
		});
	}, [navigate, filtrosUrl.limite]);

	// Verificar se há filtros ativos
	const hasActiveFilters = !!(
		filtrosUrl.nome ||
		filtrosUrl.email ||
		(filtrosUrl.status && filtrosUrl.status !== "todos") ||
		(filtrosUrl.roles && filtrosUrl.roles.length > 0)
	);

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
				<div className="space-y-6">
					<DataTable
						{...dataTable.getTableProps()}
						columns={columns}
						data={data?.usuarios || []}
						isLoading={isLoading}
						error={error ? new Error(error.message) : null}
						title="Usuários"
						description={`${data?.total || 0} usuários encontrados`}
						onRowClick={handleRowClick}
						showClearFilters={hasActiveFilters}
						onClearFilters={handleClearFilters}
						emptyMessage={
							hasActiveFilters
								? "Nenhum usuário encontrado para os filtros aplicados"
								: "Nenhum usuário cadastrado"
						}
						filterComponents={{
							name: filtroNome,
							email: filtroEmail,
							isActive: filtroStatus,
							roles: filtroFuncao,
						}}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
