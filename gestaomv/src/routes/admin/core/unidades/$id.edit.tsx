import { RouteGuard } from "@/components/auth/route-guard";
import { UnidadeForm } from "@/components/core/unidade-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/integrations/trpc/react";
import type { UpdateUnidadeDto } from "@/modules/core/dtos";
import { USER_ROLES } from "@/modules/core/enums";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/unidades/$id/edit")({
	component: EditUnidadePage,
});

function EditUnidadePage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const trpc = useTRPC();

	// Converter ID para number e validar
	const unidadeId = Number(id);
	if (isNaN(unidadeId)) {
		throw new Error("ID de unidade inválido");
	}

	// Queries tRPC
	const {
		data: unidade,
		isLoading,
		error,
	} = useQuery(trpc.unidades.findOne.queryOptions({ id: unidadeId }));
	const { mutate: updateUnidade, isPending } = useMutation({
		...trpc.unidades.update.mutationOptions(),
		onSuccess: () => {
			toast.success("Unidade atualizada com sucesso!");
			navigate({ to: "/admin/core/unidades" });
		},
		onError: (error) => {
			toast.error(`Erro ao atualizar unidade: ${error.message}`);
		},
	});

	const handleSubmit = (data: UpdateUnidadeDto) => {
		updateUnidade({ id: unidadeId, data });
	};

	const handleBack = () => {
		navigate({ to: "/admin/core/unidades" });
	};

	const header = (
		<PageHeader
			title="Editar Unidade"
			subtitle={unidade?.nome || "Carregando..."}
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

	if (isLoading) {
		return (
			<RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-4xl mx-auto">
						<Card>
							<CardContent className="pt-6">
								<div className="space-y-4">
									<div className="text-center">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
										<p className="text-muted-foreground">
											Carregando dados da unidade...
										</p>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<Skeleton className="h-10" />
										<Skeleton className="h-10" />
										<Skeleton className="h-10" />
										<Skeleton className="h-10" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	if (error || !unidade) {
		return (
			<RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-4xl mx-auto">
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Unidade não encontrada
									</h3>
									<p className="text-muted-foreground mb-4">
										A unidade solicitada não foi encontrada ou você não tem
										permissão para acessá-la.
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
		<RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="max-w-4xl mx-auto space-y-6">
					<UnidadeForm
						mode="edit"
						initialData={unidade}
						onSubmit={handleSubmit}
						isSubmitting={isPending}
					/>

					{/* Informações adicionais */}
					<Card>
						<CardContent className="pt-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium">Empresa vinculada:</span>
									<span className="ml-2 text-muted-foreground">
										{unidade.empresa?.razaoSocial ||
											"Nenhuma empresa vinculada"}
									</span>
								</div>
								<div>
									<span className="font-medium">Código:</span>
									<span className="ml-2 text-muted-foreground">
										{unidade.codigo}
									</span>
								</div>
								<div>
									<span className="font-medium">Criado em:</span>
									<span className="ml-2 text-muted-foreground">
										{unidade.createdAt
											? new Date(unidade.createdAt).toLocaleDateString("pt-BR")
											: "N/A"}
									</span>
								</div>
								<div>
									<span className="font-medium">Última atualização:</span>
									<span className="ml-2 text-muted-foreground">
										{unidade.updatedAt
											? new Date(unidade.updatedAt).toLocaleDateString("pt-BR")
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
