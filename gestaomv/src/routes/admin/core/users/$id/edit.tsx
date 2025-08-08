import { RouteGuard } from "@/components/auth/route-guard";
import { UserBasicForm } from "@/components/core/user-basic-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRolesManager } from "@/components/user-roles-manager";
import { ALL_ROLES } from "@/constants";
import type { UserRoleType } from "@/constants";
import type { updateUserSchema } from "@/modules/core/dtos";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

type UpdateUserData = z.infer<typeof updateUserSchema>;

interface RouteSearch {
	newUser?: boolean;
}

export const Route = createFileRoute("/admin/core/users/$id/edit")({
	component: EditUserPage,
	validateSearch: (search: Record<string, unknown>): RouteSearch => ({
		newUser: Boolean(search.newUser),
	}),
});

function EditUserPage() {
	const { id } = Route.useParams();
	const { newUser } = Route.useSearch();
	const navigate = useNavigate();
	const [userRoles, setUserRoles] = useState<UserRoleType[]>([]);
	const trpc = useTRPC();

	// Converter ID para number e validar
	const userId = Number(id);
	if (Number.isNaN(userId)) {
		throw new Error("ID de usuário inválido");
	}

	// Queries tRPC
	const {
		data: user,
		isLoading,
		error,
	} = useQuery(trpc.users.buscar.queryOptions({ id: userId }));
	const { mutate: updateUser, isPending } = useMutation({
		...trpc.users.atualizar.mutationOptions(),
		onSuccess: () => {
			toast.success("Usuário atualizado com sucesso!");
		},
		onError: (error) => {
			toast.error(`Erro ao atualizar usuário: ${error.message}`);
		},
	});

	// Sincronizar roles do usuário com estado local
	useEffect(() => {
		if (user?.roles) {
			setUserRoles(user.roles);
		}
	}, [user]);

	const handleSubmitBasicData = (data: UpdateUserData) => {
		// Combinar dados básicos com roles atuais
		updateUser({
			id: userId,
			data: {
				...data,
				roles: userRoles,
			},
		});
	};

	const handleRoleChange = async (role: UserRoleType, isActive: boolean) => {
		const newRoles = isActive
			? [...userRoles.filter((r) => r !== role), role]
			: userRoles.filter((r) => r !== role);

		setUserRoles(newRoles);

		// Atualizar no servidor imediatamente
		updateUser(
			{
				id: userId,
				data: {
					roles: newRoles,
				},
			},
			{
				onSuccess: () => {
					toast.success(
						`Permissão ${isActive ? "adicionada" : "removida"} com sucesso!`,
					);
				},
				onError: () => {
					// Reverter estado local em caso de erro
					setUserRoles(userRoles);
					toast.error("Erro ao atualizar permissões");
				},
			},
		);
	};

	const handleBack = () => {
		navigate({ to: "/admin/core/users" });
	};

	const header = (
		<PageHeader
			title="Editar Usuário"
			subtitle={user?.name || "Carregando..."}
			icon={<User className="h-5 w-5" />}
			onClickBack={handleBack}
			backButtonText="Voltar"
			actions={[
				<Button key="cancel" variant="outline" onClick={handleBack}>
					Cancelar
				</Button>,
			]}
		/>
	);

	if (isLoading) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-6xl mx-auto">
						<Card>
							<CardContent className="pt-6">
								<div className="space-y-4">
									<div className="text-center">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
										<p className="text-muted-foreground">
											Carregando dados do usuário...
										</p>
									</div>
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
										<div className="space-y-4">
											<Skeleton className="h-10" />
											<Skeleton className="h-10" />
											<Skeleton className="h-20" />
										</div>
										<div className="space-y-4">
											<Skeleton className="h-40" />
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	if (error || !user) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-6xl mx-auto">
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Usuário não encontrado
									</h3>
									<p className="text-muted-foreground mb-4">
										O usuário solicitado não foi encontrado ou você não tem
										permissão para acessá-lo.
									</p>
									<Button onClick={handleBack}>Voltar para listagem</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	return (
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="max-w-6xl mx-auto space-y-6">
					{/* Alerta para usuários recém-criados */}
					{newUser && (
						<Alert>
							<User className="h-4 w-4" />
							<AlertDescription>
								Usuário criado com sucesso! Agora você pode configurar as
								permissões e funções necessárias.
							</AlertDescription>
						</Alert>
					)}

					{/* Formulário Básico */}
					<div>
						<UserBasicForm
							mode="edit"
							initialData={user}
							onSubmit={handleSubmitBasicData}
							isSubmitting={isPending}
						/>
					</div>

					{/* Gerenciador de Roles */}
					<div>
						<UserRolesManager
							userRoles={userRoles}
							onRoleChange={handleRoleChange}
							readOnly={isPending}
						/>
					</div>

					{/* Informações adicionais */}
					<Card>
						<CardContent className="pt-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
								<div>
									<span className="font-medium">Status:</span>
									<span className="ml-2 text-muted-foreground">
										{user.isActive ? "Ativo" : "Inativo"}
									</span>
								</div>
								<div>
									<span className="font-medium">Criado em:</span>
									<span className="ml-2 text-muted-foreground">
										{user.createdAt
											? new Date(user.createdAt).toLocaleDateString("pt-BR")
											: "N/A"}
									</span>
								</div>
								<div>
									<span className="font-medium">Última atualização:</span>
									<span className="ml-2 text-muted-foreground">
										{user.updatedAt
											? new Date(user.updatedAt).toLocaleDateString("pt-BR")
											: "N/A"}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
