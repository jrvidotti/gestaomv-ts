import { RouteGuard } from "@/components/auth/route-guard";
import { UnidadeForm } from "@/components/core/unidade-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ALL_ROLES } from "@/constants";
import type { CreateUnidadeDto } from "@/modules/core/dtos";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/unidades/nova")({
	component: NovaUnidadePage,
});

function NovaUnidadePage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const { mutate: createUnidade, isPending } = useMutation({
		...trpc.unidades.create.mutationOptions(),
		onSuccess: () => {
			toast.success("Unidade criada com sucesso!");
			navigate({ to: "/admin/core/unidades" });
		},
		onError: (error) => {
			toast.error(`Erro ao criar unidade: ${error.message}`);
		},
	});

	const handleSubmit = (data: CreateUnidadeDto) => {
		createUnidade(data);
	};

	const handleBack = () => {
		navigate({ to: "/admin/core/unidades" });
	};

	const header = (
		<PageHeader
			title="Nova Unidade"
			subtitle="Cadastrar nova unidade no sistema"
			icon={<MapPin className="h-5 w-5" />}
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
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="max-w-4xl mx-auto">
					<UnidadeForm
						mode="create"
						onSubmit={handleSubmit}
						isSubmitting={isPending}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
