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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { USER_ROLES } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import type { FiltrosDepartamentos } from "@/modules/rh/types";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Building2,
	Eye,
	Filter,
	MoreHorizontal,
	Pencil,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { useState } from "react";

type DepartamentosSearch = {
	busca?: string;
	pagina?: number;
};

export const Route = createFileRoute("/admin/rh/departamentos/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): DepartamentosSearch => ({
		busca: typeof search.busca === "string" ? search.busca : undefined,
		pagina: typeof search.pagina === "number" ? search.pagina : 1,
	}),
});

function RouteComponent() {
	const navigate = useNavigate();
	const { busca: buscaUrl, pagina: paginaUrl } = Route.useSearch();

	const [busca, setBusca] = useState(buscaUrl || "");
	const [paginaAtual, setPaginaAtual] = useState(paginaUrl || 1);

	const trpc = useTRPC();
	const buscaDebounced = useDebounce(busca, 300);

	const filtros: FiltrosDepartamentos = {
		busca: buscaDebounced || undefined,
		pagina: paginaAtual,
		limite: 20,
	};

	const { data, isLoading, refetch } = useQuery(
		trpc.rh.departamentos.listar.queryOptions(filtros),
	);

	const { mutate: removerDepartamento } = useMutation({
		...trpc.rh.departamentos.deletar.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
	});

	const handleRemover = async (id: number, nome: string) => {
		if (
			confirm(
				`Deseja realmente remover o departamento "${nome}"? Esta ação não pode ser desfeita.`,
			)
		) {
			removerDepartamento({ id });
		}
	};

	const limparFiltros = () => {
		setBusca("");
		setPaginaAtual(1);
		navigate({
			to: "/admin/rh/departamentos",
			search: {},
		});
	};

	const totalPaginas = data ? Math.ceil(data.total / filtros.limite) : 0;

	const header = (
		<PageHeader
			title="Departamentos"
			subtitle="Gerencie os departamentos da empresa"
			actions={[
				<Link key="novo-departamento" to="/admin/rh/departamentos/novo">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Novo Departamento
					</Button>
				</Link>,
			]}
		/>
	);

	return (
		<RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
			<AdminLayout header={header}>
				<div className="space-y-6">
					{/* Filtros */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Filter className="h-5 w-5" />
								Filtros
							</CardTitle>
							<CardDescription>
								Use os filtros abaixo para encontrar departamentos específicos
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4 md:flex-row md:items-end">
								<div className="flex-1">
									<label
										htmlFor="busca"
										className="text-sm font-medium mb-2 block"
									>
										Buscar
									</label>
									<div className="relative">
										<Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
										<Input
											id="busca"
											placeholder="Buscar por nome do departamento..."
											value={busca}
											onChange={(e) => setBusca(e.target.value)}
											className="pl-9"
										/>
									</div>
								</div>
								<Button variant="outline" onClick={limparFiltros}>
									Limpar Filtros
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Tabela de Departamentos */}
					<Card>
						<CardHeader>
							<CardTitle>Departamentos Cadastrados</CardTitle>
							<CardDescription>
								{isLoading
									? "Carregando..."
									: `${data?.total || 0} departamentos encontrados`}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<p className="text-muted-foreground">
										Carregando departamentos...
									</p>
								</div>
							) : !data?.departamentos.length ? (
								<div className="text-center py-8">
									<Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Nenhum departamento encontrado
									</h3>
									<p className="text-muted-foreground mb-4">
										{busca
											? "Tente ajustar os filtros para encontrar departamentos."
											: "Comece criando o primeiro departamento da empresa."}
									</p>
									{!busca && (
										<Link to="/admin/rh/departamentos/novo">
											<Button>
												<Plus className="h-4 w-4 mr-2" />
												Criar Primeiro Departamento
											</Button>
										</Link>
									)}
								</div>
							) : (
								<>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Nome</TableHead>
												<TableHead>Código</TableHead>
												<TableHead>Funcionários</TableHead>
												<TableHead>Equipes</TableHead>
												<TableHead>Descrição</TableHead>
												<TableHead className="w-[100px]">Ações</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.departamentos.map((departamento) => (
												<TableRow key={departamento.id}>
													<TableCell>
														<Link
															to="/admin/rh/departamentos/$id"
															params={{ id: departamento.id.toString() }}
															className="font-medium hover:underline"
														>
															{departamento.nome}
														</Link>
													</TableCell>
													<TableCell>
														<Badge variant="outline" className="font-mono">
															{departamento.codigo || "N/A"}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="text-sm text-muted-foreground">
															Dados não disponíveis
														</div>
													</TableCell>
													<TableCell>
														<div className="text-sm text-muted-foreground">
															Dados não disponíveis
														</div>
													</TableCell>
													<TableCell>
														<p className="text-sm text-muted-foreground max-w-xs truncate">
															{departamento.descricao || "Sem descrição"}
														</p>
													</TableCell>
													<TableCell>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" size="sm">
																	<MoreHorizontal className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<Link
																	to="/admin/rh/departamentos/$id"
																	params={{ id: departamento.id.toString() }}
																>
																	<DropdownMenuItem>
																		<Eye className="h-4 w-4 mr-2" />
																		Visualizar
																	</DropdownMenuItem>
																</Link>
																<Link
																	to="/admin/rh/departamentos/$id/edit"
																	params={{ id: departamento.id.toString() }}
																>
																	<DropdownMenuItem>
																		<Pencil className="h-4 w-4 mr-2" />
																		Editar
																	</DropdownMenuItem>
																</Link>
																<DropdownMenuItem
																	onClick={() =>
																		handleRemover(
																			departamento.id,
																			departamento.nome,
																		)
																	}
																	className="text-destructive"
																>
																	<Trash2 className="h-4 w-4 mr-2" />
																	Remover
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>

									{/* Paginação */}
									{totalPaginas > 1 && (
										<div className="flex items-center justify-between pt-4">
											<p className="text-sm text-muted-foreground">
												Página {paginaAtual} de {totalPaginas}
											</p>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														const novaPagina = Math.max(1, paginaAtual - 1);
														setPaginaAtual(novaPagina);
														navigate({
															to: "/admin/rh/departamentos",
															search: {
																...Route.useSearch(),
																pagina: novaPagina,
															},
														});
													}}
													disabled={paginaAtual === 1}
												>
													Anterior
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														const novaPagina = Math.min(
															totalPaginas,
															paginaAtual + 1,
														);
														setPaginaAtual(novaPagina);
														navigate({
															to: "/admin/rh/departamentos",
															search: {
																...Route.useSearch(),
																pagina: novaPagina,
															},
														});
													}}
													disabled={paginaAtual === totalPaginas}
												>
													Próxima
												</Button>
											</div>
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
