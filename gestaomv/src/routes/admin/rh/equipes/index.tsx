import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { LookupSelect } from "@/components/lookup-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useDebounce } from "@/hooks/use-debounce";
import { useTRPC } from "@/integrations/trpc/react";
import { USER_ROLES } from "@/modules/core/enums";
import type { FiltrosEquipes } from "@/modules/rh/types";
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
	Users,
} from "lucide-react";
import { useState } from "react";

type EquipesSearch = {
	busca?: string;
	departamentoId?: string;
	pagina?: number;
};

export const Route = createFileRoute("/admin/rh/equipes/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): EquipesSearch => ({
		busca: typeof search.busca === "string" ? search.busca : undefined,
		departamentoId:
			typeof search.departamentoId === "string"
				? search.departamentoId
				: undefined,
		pagina: typeof search.pagina === "number" ? search.pagina : 1,
	}),
});

function RouteComponent() {
	const navigate = useNavigate();
	const {
		busca: buscaUrl,
		departamentoId: deptoUrl,
		pagina: paginaUrl,
	} = Route.useSearch();

	const [busca, setBusca] = useState(buscaUrl || "");
	const [departamentoSelecionado, setDepartamentoSelecionado] = useState<
		string | null
	>(deptoUrl || null);
	const [paginaAtual, setPaginaAtual] = useState(paginaUrl || 1);

	const trpc = useTRPC();
	const buscaDebounced = useDebounce(busca, 300);

	const filtros: FiltrosEquipes = {
		busca: buscaDebounced || undefined,
		departamentoId:
			departamentoSelecionado && departamentoSelecionado !== "all"
				? departamentoSelecionado
				: undefined,
		pagina: paginaAtual,
		limite: 20,
	};

	const { data, isLoading, refetch } = useQuery(
		trpc.rh.equipes.listar.queryOptions(filtros),
	);
	const { data: departamentosResponse, isLoading: isLoadingDepartamentos } =
		useQuery(trpc.rh.departamentos.listar.queryOptions({}));

	// Extrair departamentos do objeto retornado pela query
	const departamentosData = departamentosResponse?.departamentos || [];

	const { mutate: removerEquipe } = useMutation({
		...trpc.rh.equipes.deletar.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
	});

	const handleRemover = async (id: number, nome: string) => {
		if (
			confirm(
				`Deseja realmente remover a equipe "${nome}"? Esta ação não pode ser desfeita.`,
			)
		) {
			removerEquipe({ id });
		}
	};

	const limparFiltros = () => {
		setBusca("");
		setDepartamentoSelecionado(null);
		setPaginaAtual(1);
		navigate({
			to: "/admin/rh/equipes",
			search: {},
		});
	};

	const totalPaginas = data ? Math.ceil(data.total / filtros.limite) : 0;

	const header = (
		<PageHeader
			title="Equipes"
			subtitle="Gerencie as equipes de trabalho da empresa"
			actions={[
				<Link key="nova-equipe" to="/admin/rh/equipes/nova">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Nova Equipe
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
							<CardDescription>
								Use os filtros abaixo para encontrar equipes específicas
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
											placeholder="Buscar por nome da equipe..."
											value={busca}
											onChange={(e) => setBusca(e.target.value)}
											className="pl-9"
										/>
									</div>
								</div>
								<div>
									{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
									<label className="text-sm font-medium mb-2 block">
										Departamento
									</label>
									<LookupSelect
										className="w-64"
										value={departamentoSelecionado ?? "all"}
										onValueChange={(val) =>
											setDepartamentoSelecionado(
												val && val !== "all" ? val : null,
											)
										}
										options={
											departamentosData?.map((e) => ({
												value: e.id.toString(),
												label: e.nome,
											})) ?? []
										}
										placeholder="Selecione um departamento"
										emptyMessage={
											isLoadingDepartamentos
												? "Carregando..."
												: "Nenhum departamento encontrado"
										}
										disabled={isLoading || isLoadingDepartamentos}
									/>
								</div>
								<Button variant="outline" onClick={limparFiltros}>
									Limpar Filtros
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Tabela de Equipes */}
					<Card>
						<CardHeader>
							<CardTitle>Equipes Cadastradas</CardTitle>
							<CardDescription>
								{isLoading
									? "Carregando..."
									: `${data?.total || 0} equipes encontradas`}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<p className="text-muted-foreground">Carregando equipes...</p>
								</div>
							) : !data?.equipes.length ? (
								<div className="text-center py-8">
									<Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Nenhuma equipe encontrada
									</h3>
									<p className="text-muted-foreground mb-4">
										{busca || departamentoSelecionado
											? "Tente ajustar os filtros para encontrar equipes."
											: "Comece criando a primeira equipe da empresa."}
									</p>
									{!busca && !departamentoSelecionado && (
										<Link to="/admin/rh/equipes/nova">
											<Button>
												<Plus className="h-4 w-4 mr-2" />
												Criar Primeira Equipe
											</Button>
										</Link>
									)}
								</div>
							) : (
								<>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Equipe</TableHead>
												<TableHead>Líder</TableHead>
												<TableHead>Departamento</TableHead>
												<TableHead>Membros</TableHead>
												<TableHead>Descrição</TableHead>
												<TableHead className="w-[100px]">Ações</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.equipes.map((equipe) => (
												<TableRow key={equipe.id}>
													<TableCell>
														<Link
															to="/admin/rh/equipes/$id"
															params={{ id: equipe.id.toString() }}
															className="font-medium hover:underline"
														>
															{equipe.nome}
														</Link>
													</TableCell>
													<TableCell>
														{equipe.lider ? (
															<div className="flex items-center gap-2">
																<Avatar className="h-8 w-8">
																	<AvatarImage
																		src={equipe.lider.foto || undefined}
																	/>
																	<AvatarFallback>
																		{equipe.lider.nome
																			.split(" ")
																			.map((n) => n[0])
																			.join("")
																			.toUpperCase()}
																	</AvatarFallback>
																</Avatar>
																<span className="text-sm">
																	{equipe.lider.nome}
																</span>
															</div>
														) : (
															<span className="text-muted-foreground text-sm">
																Sem líder
															</span>
														)}
													</TableCell>
													<TableCell>
														<Badge variant="outline">
															{equipe.departamento?.nome || "N/A"}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-2">
															<Users className="h-4 w-4 text-muted-foreground" />
															<span className="text-sm">
																{equipe.membros?.length || 0} membros
															</span>
														</div>
													</TableCell>
													<TableCell>
														<p className="text-sm text-muted-foreground max-w-xs truncate">
															{equipe.descricao || "Sem descrição"}
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
																	to="/admin/rh/equipes/$id"
																	params={{ id: equipe.id.toString() }}
																>
																	<DropdownMenuItem>
																		<Eye className="h-4 w-4 mr-2" />
																		Visualizar
																	</DropdownMenuItem>
																</Link>
																<Link
																	to="/admin/rh/equipes/$id/edit"
																	params={{ id: equipe.id.toString() }}
																>
																	<DropdownMenuItem>
																		<Pencil className="h-4 w-4 mr-2" />
																		Editar
																	</DropdownMenuItem>
																</Link>
																<DropdownMenuItem
																	onClick={() =>
																		handleRemover(equipe.id, equipe.nome)
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
															to: "/admin/rh/equipes",
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
															to: "/admin/rh/equipes",
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
