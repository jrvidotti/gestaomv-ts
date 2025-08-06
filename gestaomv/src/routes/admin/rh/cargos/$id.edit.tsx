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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ALL_ROLES } from "@/constants";
import {
	type AtualizarCargoData,
	atualizarCargoSchema,
} from "@/modules/rh/dtos/cargos";
import { useTRPC } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rh/cargos/$id/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const trpc = useTRPC();

	const { data: cargo, isLoading } = useQuery(
		trpc.rh.cargos.buscar.queryOptions({ id: Number(id) }),
	);

	const { data: departamentosData } = useQuery(
		trpc.rh.departamentos.listar.queryOptions({}),
	);

	// Extrair departamentos do objeto retornado pela query
	const departamentos = departamentosData?.departamentos || [];

	const { mutate: atualizarCargo, isPending } = useMutation({
		...trpc.rh.cargos.atualizar.mutationOptions(),
		onSuccess: () => {
			toast.success("Cargo atualizado com sucesso!");
			navigate({ to: "/admin/rh/cargos" });
		},
		onError: (error) => {
			toast.error(`Erro ao atualizar cargo: ${error.message}`);
		},
	});

	const form = useForm<AtualizarCargoData>({
		resolver: zodResolver(atualizarCargoSchema),
		defaultValues: {
			nome: "",
			departamentoId: 0,
			descricao: "",
		},
	});

	// Atualizar valores padrão quando o cargo for carregado
	useEffect(() => {
		if (cargo) {
			form.reset({
				nome: cargo.nome || "",
				departamentoId: cargo.departamentoId || 0,
				descricao: cargo.descricao || "",
			});
		}
	}, [cargo, form]);

	const onSubmit = (data: AtualizarCargoData) => {
		atualizarCargo({
			id: Number(id),
			data: {
				...data,
				descricao: data.descricao || undefined,
			},
		});
	};

	const header = (
		<PageHeader
			title={`Editar Cargo ${cargo?.nome ? `- ${cargo.nome}` : ""}`}
			subtitle="Atualize as informações do cargo"
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

	if (isLoading) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN, ALL_ROLES.GERENCIA_RH]}>
				<AdminLayout header={header}>
					<div className="flex items-center justify-center py-8">
						<p className="text-muted-foreground">Carregando cargo...</p>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	if (!cargo) {
		return (
			<RouteGuard requiredRoles={[ALL_ROLES.ADMIN, ALL_ROLES.GERENCIA_RH]}>
				<AdminLayout header={header}>
					<div className="flex items-center justify-center py-8">
						<p className="text-muted-foreground">Cargo não encontrado</p>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	return (
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN, ALL_ROLES.GERENCIA_RH]}>
			<AdminLayout header={header}>
				<div className="max-w-2xl mx-auto">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Building2 className="h-5 w-5" />
								Informações do Cargo
							</CardTitle>
							<CardDescription>
								Atualize as informações do cargo
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
														placeholder="Ex: Analista de Sistemas"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Departamento */}
									<FormField
										control={form.control}
										name="departamentoId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Departamento *</FormLabel>
												<Select
													value={field.value?.toString()}
													onValueChange={(value) =>
														field.onChange(Number(value))
													}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Selecione um departamento" />
														</SelectTrigger>
													</FormControl>
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
														placeholder="Descreva as responsabilidades e requisitos do cargo..."
														rows={4}
														{...field}
													/>
												</FormControl>
												<p className="text-sm text-muted-foreground">
													Descrição detalhada das responsabilidades do cargo
													(opcional)
												</p>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Informações adicionais */}
									<div className="pt-4 border-t">
										<h3 className="text-sm font-medium mb-3">Informações</h3>
										<div className="text-sm text-muted-foreground space-y-2">
											<p>• O nome do cargo deve ser único na organização</p>
											<p>
												• Alterar o departamento pode afetar funcionários
												vinculados
											</p>
											<p>
												• A descrição ajuda no processo de recrutamento e
												seleção
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
