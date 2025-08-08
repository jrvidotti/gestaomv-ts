import { RouteGuard } from "@/components/auth/route-guard";
import { CarteiraForm } from "@/components/factoring/forms/carteira-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/factoring/carteiras/nova")({
	component: NovaCarteiraPage,
});

function NovaCarteiraPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	// Criar carteira
	const { mutate: createCarteira, isPending } = useMutation({
		...trpc.factoring.carteiras.create.mutationOptions(),
		onSuccess: (data) => {
			toast.success("Carteira criada com sucesso!");
			navigate({
				to: "/admin/factoring/carteiras",
			});
		},
		onError: (error) => {
			toast.error(`Erro ao criar carteira: ${error.message}`);
		},
	});

	const handleSubmit = (data: any) => {
		createCarteira(data);
	};

	const handleCancel = () => {
		navigate({
			to: "/admin/factoring/carteiras",
		});
	};

	const header = (
		<PageHeader
			title="Nova Carteira"
			subtitle="Cadastrar nova carteira de pagamento e recebimento"
			icon={<Wallet className="h-5 w-5" />}
			actions={[
				<Button key="back" asChild variant="outline">
					<Link to="/admin/factoring/carteiras">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar
					</Link>
				</Button>,
			]}
		/>
	);

	return (
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="max-w-2xl mx-auto">
					<CarteiraForm
						mode="create"
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						isLoading={isPending}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
