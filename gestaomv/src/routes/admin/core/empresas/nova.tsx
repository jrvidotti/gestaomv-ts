import { RouteGuard } from "@/components/auth/route-guard";
import { EmpresaForm } from "@/components/core/empresa-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { CreateEmpresaDto } from "@/modules/core/dtos";
import { USER_ROLES } from "@/modules/core/enums";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/empresas/nova")({
	component: NovaEmpresaPage,
});

function NovaEmpresaPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const { mutate: createEmpresa, isPending } = useMutation({
		...trpc.empresas.create.mutationOptions(),
		onSuccess: () => {
			toast.success("Empresa criada com sucesso!");
			navigate({ to: "/admin/core/empresas" });
		},
		onError: (error) => {
			toast.error(`Erro ao criar empresa: ${error.message}`);
		},
	});

	const handleSubmit = (data: CreateEmpresaDto) => {
		createEmpresa(data);
	};

	const handleBack = () => {
		navigate({ to: "/admin/core/empresas" });
	};

	const header = (
		<PageHeader
			title="Nova Empresa"
			subtitle="Cadastrar nova empresa no sistema"
			icon={<Building className="h-5 w-5" />}
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
					<EmpresaForm
						mode="create"
						onSubmit={handleSubmit}
						isSubmitting={isPending}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
