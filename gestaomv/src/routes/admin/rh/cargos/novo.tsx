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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RouteGuard } from "@/components/auth/route-guard";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { USER_ROLES } from "@/modules/core/enums";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rh/cargos/novo")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const { data: departamentosData } = useQuery(
		trpc.rh.departamentos.listar.queryOptions({}),
	);

	// Extrair departamentos do objeto retornado pela query
	const departamentos = departamentosData?.departamentos || [];

	const { mutate: criarCargo, isPending } = useMutation({
		...trpc.rh.cargos.criar.mutationOptions(),
		onSuccess: () => {
			toast.success("Cargo criado com sucesso!");
			navigate({ to: "/admin/rh/cargos" });
		},
		onError: (error) => {
			toast.error(`Erro ao criar cargo: ${error.message}`);
		},
	});

	const form = useForm({
		defaultValues: {
			nome: "",
			departamentoId: "",
			descricao: "",
		},
		onSubmit: async ({ value }) => {
			if (!value.nome.trim()) {
				toast.error("Nome é obrigatório");
				return;
			}
			if (!value.departamentoId) {
				toast.error("Departamento é obrigatório");
				return;
			}
			criarCargo({
				nome: value.nome.trim(),
				departamentoId: Number(value.departamentoId),
				descricao: value.descricao.trim() || undefined,
			});
		},
	});

	const header = (
		<PageHeader
			title="Novo Cargo"
			subtitle="Cadastre um novo cargo na organização"
			actions={[
				<Button
					key="voltar"
					variant="outline"
					onClick={() => navigate({ to: "/admin/rh/cargos" })}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Voltar
				</Button>,
			]}
		/>
	);

	return (
		<RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
			<AdminLayout header={header}>
				<div className="max-w-2xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Building2 className="h-5 w-5" />
								Informações do Cargo
							</CardTitle>
							<CardDescription>
								Preencha as informações básicas do novo cargo
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
												placeholder="Ex: Analista de Sistemas"
											/>
											{field.state.meta.errors && (
												<p className="text-sm text-destructive">
													{field.state.meta.errors[0]}
												</p>
											)}
										</div>
									)}
								</form.Field>

								{/* Departamento */}
								<form.Field name="departamentoId">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Departamento *</Label>
											<Select
												value={field.state.value}
												onValueChange={(value) => field.handleChange(value)}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione um departamento" />
												</SelectTrigger>
												<SelectContent>
													{departamentos.map((dept) => (
														<SelectItem
															key={dept.id}
															value={dept.id.toString()}
														>
															{dept.nome}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
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
												placeholder="Descreva as responsabilidades e requisitos do cargo..."
												rows={4}
											/>
											<p className="text-sm text-muted-foreground">
												Descrição detalhada das responsabilidades do cargo
												(opcional)
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
									<div className="text-sm text-muted-foreground space-y-2">
										<p>• O nome do cargo deve ser único na organização</p>
										<p>
											• O departamento será usado para organizar funcionários
										</p>
										<p>
											• A descrição ajuda no processo de recrutamento e seleção
										</p>
									</div>
								</div>

								{/* Botões */}
								<div className="flex gap-4 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => navigate({ to: "/admin/rh/cargos" })}
									>
										Cancelar
									</Button>
									<Button type="submit" disabled={isPending}>
										<Save className="h-4 w-4 mr-2" />
										{isPending ? "Criando..." : "Criar Cargo"}
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
