import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/auth/route-guard";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { USER_ROLES } from "@/modules/core/enums";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rh/departamentos/$id/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const trpc = useTRPC();

	const { data: departamento, isLoading } = useQuery(
		trpc.rh.departamentos.buscar.queryOptions({ id: Number(id) }),
	);

	const { mutate: atualizarDepartamento, isPending } = useMutation({
		...trpc.rh.departamentos.atualizar.mutationOptions(),
		onSuccess: () => {
			toast.success("Departamento atualizado com sucesso!");
			navigate({ to: "/admin/rh/departamentos" });
		},
		onError: (error) => {
			toast.error(`Erro ao atualizar departamento: ${error.message}`);
		},
	});

	const form = useForm({
		defaultValues: {
			nome: departamento?.nome || "",
			codigo: departamento?.codigo || "",
			descricao: departamento?.descricao || "",
		},
		onSubmit: async ({ value }) => {
			if (!value.nome.trim()) {
				toast.error("Nome é obrigatório");
				return;
			}
			atualizarDepartamento({ id: Number(id), data: value });
		},
	});

	// Atualizar valores do formulário quando os dados chegarem
	if (departamento && !form.state.isDirty) {
		form.setFieldValue("nome", departamento.nome);
		form.setFieldValue("codigo", departamento.codigo || "");
		form.setFieldValue("descricao", departamento.descricao || "");
	}

	const header = (
		<PageHeader
			title={`Editar Departamento ${departamento?.nome ? `- ${departamento.nome}` : ""}`}
			subtitle="Atualize as informações do departamento"
			actions={[
				<Button
					key="voltar"
					variant="outline"
					onClick={() => navigate({ to: "/admin/rh/departamentos" })}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Voltar
				</Button>,
			]}
		/>
	);

	if (isLoading) {
		return (
			<RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
				<AdminLayout header={header}>
					<div className="flex items-center justify-center py-8">
						<p className="text-muted-foreground">Carregando departamento...</p>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	if (!departamento) {
		return (
			<RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
				<AdminLayout header={header}>
					<div className="flex items-center justify-center py-8">
						<p className="text-muted-foreground">Departamento não encontrado</p>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	return (
		<RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
			<AdminLayout header={header}>
				<div className="max-w-2xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle>Informações do Departamento</CardTitle>
							<CardDescription>
								Atualize as informações do departamento
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									form.handleSubmit();
								}}
								className="space-y-6"
							>
								{/* Nome */}
								<form.Field name="nome">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Nome *</Label>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Ex: Recursos Humanos"
											/>
											{field.state.meta.errors && (
												<p className="text-sm text-destructive">
													{field.state.meta.errors[0]}
												</p>
											)}
										</div>
									)}
								</form.Field>

								{/* Código */}
								<form.Field name="codigo">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Código</Label>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Ex: RH"
												className="font-mono"
											/>
											<p className="text-sm text-muted-foreground">
												Código identificador do departamento (opcional)
											</p>
											{field.state.meta.errors && (
												<p className="text-sm text-destructive">
													{field.state.meta.errors[0]}
												</p>
											)}
										</div>
									)}
								</form.Field>

								{/* Descrição */}
								<form.Field name="descricao">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Descrição</Label>
											<Textarea
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Descreva as responsabilidades e objetivos do departamento..."
												rows={3}
											/>
											<p className="text-sm text-muted-foreground">
												Descrição detalhada do departamento (opcional)
											</p>
											{field.state.meta.errors && (
												<p className="text-sm text-destructive">
													{field.state.meta.errors[0]}
												</p>
											)}
										</div>
									)}
								</form.Field>

								{/* Informações adicionais */}
								<div className="pt-4 border-t">
									<h3 className="text-sm font-medium mb-3">Informações</h3>
									<div className="text-sm text-muted-foreground">
										Departamento criado e pronto para receber funcionários e
										equipes.
									</div>
								</div>

								{/* Botões */}
								<div className="flex gap-4 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => navigate({ to: "/admin/rh/departamentos" })}
									>
										Cancelar
									</Button>
									<Button type="submit" disabled={isPending}>
										<Save className="h-4 w-4 mr-2" />
										{isPending ? "Salvando..." : "Salvar Alterações"}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
