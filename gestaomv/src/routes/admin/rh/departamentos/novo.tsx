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
import { USER_ROLES } from "@/constants";
import {
	type CriarDepartamentoData,
	criarDepartamentoSchema,
} from "@/modules/rh/dtos/departamentos";
import { useTRPC } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rh/departamentos/novo")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const { mutate: criarDepartamento, isPending } = useMutation({
		...trpc.rh.departamentos.criar.mutationOptions(),
		onSuccess: () => {
			toast.success("Departamento criado com sucesso!");
			navigate({ to: "/admin/rh/departamentos" });
		},
		onError: (error) => {
			toast.error(`Erro ao criar departamento: ${error.message}`);
		},
	});

	const form = useForm<CriarDepartamentoData>({
		resolver: zodResolver(criarDepartamentoSchema),
		defaultValues: {
			nome: "",
			descricao: "",
		},
	});

	const onSubmit = (data: CriarDepartamentoData) => {
		criarDepartamento({
			...data,
			descricao: data.descricao || undefined,
		});
	};

	const header = (
		<PageHeader
			title="Novo Departamento"
			subtitle="Cadastre um novo departamento na empresa"
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

	return (
		<RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
			<AdminLayout header={header}>
				<div className="max-w-2xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle>Informações do Departamento</CardTitle>
							<CardDescription>
								Preencha as informações básicas do novo departamento
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
											{isPending ? "Salvando..." : "Salvar Departamento"}
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
