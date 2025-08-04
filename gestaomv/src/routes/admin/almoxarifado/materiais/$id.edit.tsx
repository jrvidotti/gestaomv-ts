import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { z } from "zod";

import { MaterialForm } from "@/components/almoxarifado/material-form";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/integrations/trpc/react";
import { atualizarMaterialSchema } from "@/modules/almoxarifado/dtos";

type AtualizarMaterialData = z.infer<typeof atualizarMaterialSchema>;

export const Route = createFileRoute("/admin/almoxarifado/materiais/$id/edit")({
	component: EditMaterialPage,
});

function EditMaterialPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const materialId = parseInt(id);

	const { data: material, isLoading: isLoadingMaterial } = useQuery(
		trpc.almoxarifado.materiais.buscar.queryOptions({ id: materialId }),
	);

	const { mutate: atualizarMaterial, isPending } = useMutation({
		...trpc.almoxarifado.materiais.atualizar.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["almoxarifado", "materiais", "listar"],
			});
			queryClient.invalidateQueries({
				queryKey: ["almoxarifado", "materiais", "buscar", { id: materialId }],
			});
			toast.success("Material atualizado com sucesso!");
			navigate({ to: "/admin/almoxarifado/materiais" });
		},
		onError: (error) => {
			toast.error("Erro ao atualizar material", {
				description: error.message,
			});
		},
	});

	const onSubmit = (values: AtualizarMaterialData) => {
		atualizarMaterial({
			id: materialId,
			data: values,
		});
	};

	const header = (
		<PageHeader
			title="Editar Material"
			subtitle={material ? `Editando: ${material.nome}` : "Carregando..."}
			onClickBack={() => navigate({ to: "/admin/almoxarifado/materiais" })}
			backButtonText="Voltar"
			actions={[
				<Button
					key="cancelar"
					type="button"
					variant="outline"
					onClick={() => navigate({ to: "/admin/almoxarifado/materiais" })}
					disabled={isPending}
				>
					Cancelar
				</Button>,
				<Button
					key="salvar"
					type="submit"
					disabled={isPending || isLoadingMaterial}
					form="material-edit-form"
				>
					{isPending ? "Salvando..." : "Salvar"}
				</Button>,
			]}
		/>
	);

	if (isLoadingMaterial) {
		return (
			<AdminLayout header={header}>
				<div className="flex items-center justify-center h-32">
					<div className="text-muted-foreground">Carregando dados do material...</div>
				</div>
			</AdminLayout>
		);
	}

	if (!material) {
		return (
			<AdminLayout header={header}>
				<div className="flex items-center justify-center h-32">
					<div className="text-red-500">Material não encontrado</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout header={header}>
			<MaterialForm
				mode="edit"
				initialData={material}
				onSubmit={onSubmit}
				isSubmitting={isPending}
				isLoading={isLoadingMaterial}
				formId="material-edit-form"
			/>
		</AdminLayout>
	);
}