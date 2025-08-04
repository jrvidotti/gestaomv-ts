import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/integrations/trpc/react";
import { USER_ROLES } from "@/modules/core/enums";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Filter, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rh/cargos/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [busca, setBusca] = useState("");
	const [departamentoId, setDepartamentoId] = useState<string>("all");
	const trpc = useTRPC();

	const { data, isLoading, refetch } = useQuery(
		trpc.rh.cargos.listar.queryOptions({
			busca: busca || undefined,
			departamentoId:
				departamentoId && departamentoId !== "all"
					? Number(departamentoId)
					: undefined,
		}),
	);

	const { data: departamentosData } = useQuery(
		trpc.rh.departamentos.listar.queryOptions({}),
	);

	// Extrair departamentos do objeto retornado pela query
	const departamentos = departamentosData?.departamentos || [];

	const { mutate: deletarCargo } = useMutation({
		...trpc.rh.cargos.deletar.mutationOptions(),
		onSuccess: () => {
			toast.success("Cargo deletado com sucesso!");
			refetch();
		},
		onError: (error) => {
			toast.error(`Erro ao deletar cargo: ${error.message}`);
		},
	});

	const handleDeletar = (id: number, nome: string) => {
		if (confirm(`Tem certeza que deseja deletar o cargo "${nome}"?`)) {
			deletarCargo({ id });
		}
	};

	const header = (
		<PageHeader
			title="Cargos"
			subtitle="Gerencie os cargos da organização"
			actions={[
				<Link key="novo" to="/admin/rh/cargos/novo">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Novo Cargo
					</Button>
				</Link>,
			]}
		/>
	);

	return (
		<RouteGuard
			requiredRoles={[
				USER_ROLES.ADMIN,
				USER_ROLES.GERENCIA_RH,
				USER_ROLES.USUARIO_RH,
			]}
		>
			<AdminLayout header={header}>
				<div className="space-y-6">
					{/* Filtros */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Filter className="h-5 w-5" />
								Filtros
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex gap-4 flex-wrap">
								<div className="flex-1 min-w-[200px]">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											placeholder="Buscar por nome ou descrição..."
											value={busca}
											onChange={(e) => setBusca(e.target.value)}
											className="pl-9"
										/>
									</div>
								</div>
								<div className="w-48">
									<Select
										value={departamentoId}
										onValueChange={(value) =>
											setDepartamentoId(value === "all" ? "" : value)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Todos os departamentos" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												Todos os departamentos
											</SelectItem>
											{departamentos.map((dept) => (
												<SelectItem key={dept.id} value={dept.id.toString()}>
													{dept.nome}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Lista de Cargos */}
					<Card>
						<CardHeader>
							<CardTitle>Cargos Cadastrados</CardTitle>
							<CardDescription>
								{data?.total
									? `${data.total} cargo(s) encontrado(s)`
									: "Nenhum cargo encontrado"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<p className="text-muted-foreground">Carregando cargos...</p>
								</div>
							) : data && data.cargos.length > 0 ? (
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Nome</TableHead>
												<TableHead>Departamento</TableHead>
												<TableHead>Descrição</TableHead>
												<TableHead className="text-right">Ações</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.cargos.map((cargo) => (
												<TableRow key={cargo.id}>
													<TableCell>
														<div className="font-medium">{cargo.nome}</div>
													</TableCell>
													<TableCell>
														<Badge variant="secondary">
															{cargo.departamento?.nome}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="max-w-xs">
															{cargo.descricao ? (
																<p className="text-sm text-muted-foreground truncate">
																	{cargo.descricao}
																</p>
															) : (
																<span className="text-sm text-muted-foreground italic">
																	Sem descrição
																</span>
															)}
														</div>
													</TableCell>
													<TableCell className="text-right">
														<div className="flex items-center justify-end gap-2">
															<Link
																to="/admin/rh/cargos/$id/edit"
																params={{ id: cargo.id.toString() }}
															>
																<Button variant="ghost" size="sm">
																	<Pencil className="h-4 w-4" />
																</Button>
															</Link>
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	handleDeletar(cargo.id, cargo.nome)
																}
																className="text-destructive hover:text-destructive"
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							) : (
								<div className="text-center py-8">
									<Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Nenhum cargo encontrado
									</h3>
									<p className="text-muted-foreground mb-4">
										{busca || (departamentoId && departamentoId !== "all")
											? "Tente ajustar os filtros ou cadastrar um novo cargo."
											: "Comece cadastrando o primeiro cargo da organização."}
									</p>
									<Link to="/admin/rh/cargos/novo">
										<Button>
											<Plus className="h-4 w-4 mr-2" />
											Novo Cargo
										</Button>
									</Link>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
