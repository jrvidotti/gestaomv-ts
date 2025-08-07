import { RouteGuard } from "@/components/auth/route-guard";
import { EmpresaForm } from "@/components/core/empresa-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_ROLES } from "@/constants";
import type { UpdateEmpresaDto } from "@/modules/core/dtos";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/core/empresas/$id/edit")({
	component: EditEmpresaPage,
});

function EditEmpresaPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const trpc = useTRPC();

	// Converter ID para number e validar
	const empresaId = Number(id);
	if (Number.isNaN(empresaId)) {
		throw new Error("ID de empresa inválido");
	}

	// Queries tRPC
	const {
		data: empresa,
		isLoading,
		error,
	} = useQuery(trpc.empresas.buscar.queryOptions({ id: empresaId }));
	const { mutate: updateEmpresa, isPending } = useMutation({
		...trpc.empresas.atualizar.mutationOptions(),
		onSuccess: () => {
			toast.success("Empresa atualizada com sucesso!");
			navigate({ to: "/admin/core/empresas" });
		},
		onError: (error) => {
			toast.error(`Erro ao atualizar empresa: ${error.message}`);
		},
	});

	const handleSubmit = (data: UpdateEmpresaDto) => {
		updateEmpresa({ id: empresaId, data });
	};

	const handleBack = () => {
		navigate({ to: "/admin/core/empresas" });
	};

	const header = (
		<PageHeader
			title="Editar Empresa"
			subtitle={empresa?.razaoSocial || "Carregando..."}
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

	if (isLoading) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-4xl mx-auto">
						<Card>
							<CardContent className="pt-6">
								<div className="space-y-4">
									<div className="text-center">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
										<p className="text-muted-foreground">
											Carregando dados da empresa...
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

	if (error || !empresa) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
				<AdminLayout header={header}>
					<div className="max-w-4xl mx-auto">
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Empresa não encontrada
									</h3>
									<p className="text-muted-foreground mb-4">
										A empresa solicitada não foi encontrada ou você não tem
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
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<div className="max-w-4xl mx-auto space-y-6">
					<EmpresaForm
						mode="edit"
						initialData={empresa}
						onSubmit={handleSubmit}
						isSubmitting={isPending}
					/>

					{/* Informações adicionais */}
					<Card>
						<CardContent className="pt-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium">Unidades vinculadas:</span>
									<span className="ml-2 text-muted-foreground">
										{empresa._count?.unidades || 0} unidade
										{(empresa._count?.unidades || 0) !== 1 ? "s" : ""}
									</span>
								</div>
								<div>
									<span className="font-medium">Criado em:</span>
									<span className="ml-2 text-muted-foreground">
										{empresa.createdAt
											? new Date(empresa.createdAt).toLocaleDateString("pt-BR")
											: "N/A"}
									</span>
								</div>
								<div>
									<span className="font-medium">Última atualização:</span>
									<span className="ml-2 text-muted-foreground">
										{empresa.updatedAt
											? new Date(empresa.updatedAt).toLocaleDateString("pt-BR")
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
