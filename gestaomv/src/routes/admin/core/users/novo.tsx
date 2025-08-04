import { RouteGuard } from "@/components/auth/route-guard";
import { UserBasicForm } from "@/components/forms/user-basic-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/integrations/trpc/react";
import type { createUserSchema } from "@/modules/core/dtos";
import { USER_ROLES } from "@/modules/core/enums";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

type CreateUserData = z.infer<typeof createUserSchema>;

export const Route = createFileRoute("/admin/core/users/novo")({
	component: NovoUserPage,
});

function NovoUserPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const { mutate: createUser, isPending } = useMutation({
		...trpc.users.create.mutationOptions(),
		onSuccess: (data) => {
			toast.success("Usuário criado com sucesso!");

			// Se retornou o ID do usuário, redirecionar para edição para configurar roles
			if (data?.id) {
				navigate({
					to: "/admin/core/users/$id/edit",
					params: { id: data.id },
					search: { newUser: true },
				});
			} else {
				// Caso contrário, voltar para lista
				navigate({ to: "/admin/core/users" });
			}
		},
		onError: (error) => {
			toast.error(`Erro ao criar usuário: ${error.message}`);
		},
	});

	const handleSubmit = (data: CreateUserData) => {
		createUser(data);
	};

	const handleBack = () => {
		navigate({ to: "/admin/core/users" });
	};

	const header = (
		<PageHeader
			title="Novo Usuário"
			subtitle="Cadastrar novo usuário no sistema"
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

	return (
		<RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="max-w-4xl mx-auto">
					<UserBasicForm
						mode="create"
						onSubmit={handleSubmit}
						isSubmitting={isPending}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
