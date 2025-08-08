import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { z } from "zod";

import { MaterialForm } from "@/components/almoxarifado/material-form";
import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ALL_ROLES } from "@/constants";
import type { formMaterialSchema } from "@/modules/almoxarifado/dtos";
import { useTRPC } from "@/trpc/react";

type MaterialFormData = z.infer<typeof formMaterialSchema>;

export const Route = createFileRoute("/admin/almoxarifado/materiais/novo")({
	component: NovoMaterialPage,
});

function NovoMaterialPage() {
	const navigate = useNavigate();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { mutate: criarMaterial, isPending } = useMutation({
		...trpc.almoxarifado.materiais.criar.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["almoxarifado", "materiais", "listar"],
			});
			toast.success("Material criado com sucesso!");
			navigate({ to: "/admin/almoxarifado/materiais" });
		},
		onError: (error) => {
			toast.error("Erro ao criar material", {
				description: error.message,
			});
		},
	});

	const onSubmit = (values: MaterialFormData) => {
		criarMaterial(values);
	};

	const header = (
		<PageHeader
			title="Novo Material"
			subtitle="Cadastre um novo material no almoxarifado"
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
					disabled={isPending}
					form="material-form"
				>
					{isPending ? "Salvando..." : "Salvar Material"}
				</Button>,
			]}
		/>
	);

	return (
		<RouteGuard
			requiredRoles={[
				ALL_ROLES.ADMIN,
				ALL_ROLES.ALMOXARIFADO_GERENCIA,
				ALL_ROLES.ALMOXARIFADO_APROVADOR,
			]}
		>
			<AdminLayout header={header}>
				<MaterialForm
					mode="create"
					onSubmit={onSubmit}
					isSubmitting={isPending}
					formId="material-form"
				/>
			</AdminLayout>
		</RouteGuard>
	);
}
