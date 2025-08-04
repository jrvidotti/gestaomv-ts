import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/integrations/trpc/react";
import { USER_ROLES } from "@/modules/core/enums";
import {
	type AtualizarDepartamentoData,
	atualizarDepartamentoSchema,
} from "@/modules/rh/dtos/departamentos";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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

	const form = useForm<AtualizarDepartamentoData>({
		resolver: zodResolver(atualizarDepartamentoSchema),
		defaultValues: {
			nome: "",
			descricao: "",
		},
	});

	// Atualizar valores padrão quando o departamento for carregado
	useEffect(() => {
		if (departamento) {
			form.reset({
				nome: departamento.nome || "",
				descricao: departamento.descricao || "",
			});
		}
	}, [departamento, form]);

	const onSubmit = (data: AtualizarDepartamentoData) => {
		atualizarDepartamento({
			id: Number(id),
			data: {
				...data,
				descricao: data.descricao || undefined,
			},
		});
	};

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
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6"
								>
									{/* Nome */}
									<FormField
										control={form.control}
										name="nome"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nome *</FormLabel>
												<FormControl>
													<Input
														placeholder="Ex: Recursos Humanos"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Descrição */}
									<FormField
										control={form.control}
										name="descricao"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Descrição</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Descreva as responsabilidades e objetivos do departamento..."
														rows={3}
														{...field}
													/>
												</FormControl>
												<p className="text-sm text-muted-foreground">
													Descrição detalhada do departamento (opcional)
												</p>
												<FormMessage />
											</FormItem>
										)}
									/>

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
											onClick={() =>
												navigate({ to: "/admin/rh/departamentos" })
											}
										>
											Cancelar
										</Button>
										<Button type="submit" disabled={isPending}>
											<Save className="h-4 w-4 mr-2" />
											{isPending ? "Salvando..." : "Salvar Alterações"}
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
