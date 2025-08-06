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
import { USER_ROLES } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { STATUS_FUNCIONARIO } from "@/modules/rh/consts";
import {
	STATUS_FUNCIONARIO_DATA,
	STATUS_FUNCIONARIO_OPTIONS,
} from "@/modules/rh/consts";
import type { FiltrosFuncionarios } from "@/modules/rh/dtos";
import type { StatusFuncionarioType } from "@/modules/rh/types";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Eye,
	Filter,
	MoreHorizontal,
	Pencil,
	Plus,
	Search,
	UserCheck,
	UserX,
	Users,
} from "lucide-react";
import { useState } from "react";

type FuncionariosSearch = {
	busca?: string;
	status?: StatusFuncionarioType;
	departamentoId?: string;
	cargoId?: string;
	pagina?: number;
};

export const Route = createFileRoute("/admin/rh/funcionarios/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): FuncionariosSearch => ({
		busca: typeof search.busca === "string" ? search.busca : undefined,
		status:
			typeof search.status === "string"
				? (search.status as StatusFuncionarioType)
				: undefined,
		departamentoId:
			typeof search.departamentoId === "string"
				? search.departamentoId
				: undefined,
		cargoId: typeof search.cargoId === "string" ? search.cargoId : undefined,
		pagina: typeof search.pagina === "number" ? search.pagina : 1,
	}),
});

function RouteComponent() {
	const navigate = useNavigate();
	const {
		busca: buscaUrl,
		status: statusUrl,
		departamentoId: deptoUrl,
		cargoId: cargoUrl,
		pagina: paginaUrl,
	} = Route.useSearch();

	const [busca, setBusca] = useState(buscaUrl || "");
	const [statusSelecionado, setStatusSelecionado] = useState<
		StatusFuncionarioType | "all"
	>(statusUrl || "all");
	const [departamentoSelecionado, setDepartamentoSelecionado] = useState<
		string | null
	>(deptoUrl || null);
	const [cargoSelecionado, setCargoSelecionado] = useState<string | null>(
		cargoUrl || null,
	);
	const [paginaAtual, setPaginaAtual] = useState(paginaUrl || 1);

	const trpc = useTRPC();
	const buscaDebounced = useDebounce(busca, 300);

	const filtros: FiltrosFuncionarios = {
		busca: buscaDebounced || undefined,
		status:
			statusSelecionado && statusSelecionado !== "all"
				? [statusSelecionado]
				: undefined,
		departamentoId:
			departamentoSelecionado && departamentoSelecionado !== "all"
				? Number(departamentoSelecionado)
				: undefined,
		cargoId:
			cargoSelecionado && cargoSelecionado !== "all"
				? Number(cargoSelecionado)
				: undefined,
		pagina: paginaAtual,
		limite: 20,
	};

	const { data, isLoading, refetch } = useQuery(
		trpc.rh.funcionarios.listar.queryOptions(filtros),
	);
	const { data: departamentosResponse, isLoading: isLoadingDepartamentos } =
		useQuery(trpc.rh.departamentos.listar.queryOptions({}));
	const { data: cargosResponse, isLoading: isLoadingCargos } = useQuery(
		trpc.rh.cargos.listar.queryOptions({}),
	);

	// Extrair dados dos objetos retornados pelas queries
	const departamentosData = departamentosResponse?.departamentos || [];
	const cargosData = cargosResponse?.cargos || [];

	const { mutate: alterarStatusFuncionario } = useMutation({
		...trpc.rh.funcionarios.alterarStatus.mutationOptions(),
		onSuccess: () => {
			refetch();
		},
	});

	const formatPhone = (phone: string | null) => {
		if (!phone) return "N/A";
		const cleaned = phone.replace(/\D/g, "");
		if (cleaned.length === 11) {
			return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
		}
		if (cleaned.length === 10) {
			return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
		}
		return phone;
	};

	const formatCPF = (cpf: string | null) => {
		if (!cpf) return "N/A";
		const cleaned = cpf.replace(/\D/g, "");
		if (cleaned.length === 11) {
			return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
		}
		return cpf;
	};

	const handleAlterarStatus = async (
		id: number,
		novoStatus: StatusFuncionarioType,
	) => {
		const statusData = STATUS_FUNCIONARIO_DATA[novoStatus];
		if (
			confirm(
				`Deseja alterar o status do funcionário para "${statusData.label}"?`,
			)
		) {
			alterarStatusFuncionario({ id, data: { status: novoStatus } });
		}
	};

	const limparFiltros = () => {
		setBusca("");
		setStatusSelecionado("all");
		setDepartamentoSelecionado(null);
		setCargoSelecionado(null);
		setPaginaAtual(1);
		navigate({
			to: "/admin/rh/funcionarios",
			search: {},
		});
	};

	const totalPaginas = data ? Math.ceil(data.total / filtros.limite) : 0;

	const header = (
		<PageHeader
			title="Funcionários"
			subtitle="Gerencie os funcionários da empresa"
			actions={[
				<Link key="novo-funcionario" to="/admin/rh/funcionarios/novo">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Novo Funcionário
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
								Use os filtros abaixo para encontrar funcionários específicos
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4 lg:flex-row lg:items-end">
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
											placeholder="Buscar por nome, CPF, email..."
											value={busca}
											onChange={(e) => setBusca(e.target.value)}
											className="pl-9"
										/>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium mb-2 block">
										Status
									</label>
									<Select
										value={statusSelecionado}
										onValueChange={(value) =>
											setStatusSelecionado(
												value as StatusFuncionarioType | "all",
											)
										}
									>
										<SelectTrigger className="w-48">
											<SelectValue placeholder="Todos os status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos os status</SelectItem>
											{STATUS_FUNCIONARIO_OPTIONS.map((status) => (
												<SelectItem key={status.value} value={status.value}>
													{status.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
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
								<div>
									<label className="text-sm font-medium mb-2 block">
										Cargo
									</label>
									<LookupSelect
										className="w-64"
										value={cargoSelecionado ?? "all"}
										onValueChange={(val) =>
											setCargoSelecionado(val && val !== "all" ? val : null)
										}
										options={
											cargosData?.map((e) => ({
												value: e.id.toString(),
												label: e.nome,
											})) ?? []
										}
										placeholder="Selecione um cargo"
										emptyMessage={
											isLoadingCargos
												? "Carregando..."
												: "Nenhum cargo encontrado"
										}
										disabled={isLoading || isLoadingCargos}
									/>
								</div>
								<Button variant="outline" onClick={limparFiltros}>
									Limpar Filtros
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Tabela de Funcionários */}
					<Card>
						<CardHeader>
							<CardTitle>Funcionários Cadastrados</CardTitle>
							<CardDescription>
								{isLoading
									? "Carregando..."
									: `${data?.total || 0} funcionários encontrados`}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<p className="text-muted-foreground">
										Carregando funcionários...
									</p>
								</div>
							) : !data?.funcionarios.length ? (
								<div className="text-center py-8">
									<Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Nenhum funcionário encontrado
									</h3>
									<p className="text-muted-foreground mb-4">
										{busca ||
										statusSelecionado !== "all" ||
										departamentoSelecionado ||
										cargoSelecionado
											? "Tente ajustar os filtros para encontrar funcionários."
											: "Comece cadastrando o primeiro funcionário da empresa."}
									</p>
									{!busca &&
										statusSelecionado === "all" &&
										!departamentoSelecionado &&
										!cargoSelecionado && (
											<Link to="/admin/rh/funcionarios/novo">
												<Button>
													<Plus className="h-4 w-4 mr-2" />
													Cadastrar Primeiro Funcionário
												</Button>
											</Link>
										)}
								</div>
							) : (
								<>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Funcionário</TableHead>
												<TableHead>CPF</TableHead>
												<TableHead>Cargo</TableHead>
												<TableHead>Departamento</TableHead>
												<TableHead>Telefone</TableHead>
												<TableHead>Status</TableHead>
												<TableHead className="w-[100px]">Ações</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.funcionarios.map((funcionario) => (
												<TableRow key={funcionario.id}>
													<TableCell>
														<div className="flex items-center gap-3">
															<Avatar className="h-10 w-10">
																<AvatarImage
																	src={funcionario.foto || undefined}
																/>
																<AvatarFallback>
																	{funcionario.nome
																		.split(" ")
																		.map((n) => n[0])
																		.join("")
																		.toUpperCase()}
																</AvatarFallback>
															</Avatar>
															<div>
																<Link
																	to="/admin/rh/funcionarios/$id"
																	params={{ id: funcionario.id.toString() }}
																	className="font-medium hover:underline"
																>
																	{funcionario.nome}
																</Link>
																{funcionario.email && (
																	<p className="text-sm text-muted-foreground">
																		{funcionario.email}
																	</p>
																)}
															</div>
														</div>
													</TableCell>
													<TableCell className="font-mono text-sm">
														{formatCPF(funcionario.cpf)}
													</TableCell>
													<TableCell>
														<Badge variant="outline">
															{funcionario.cargo?.nome || "N/A"}
														</Badge>
													</TableCell>
													<TableCell>
														<Badge variant="outline">
															{funcionario.departamento?.nome || "N/A"}
														</Badge>
													</TableCell>
													<TableCell className="font-mono text-sm">
														{formatPhone(funcionario.telefone)}
													</TableCell>
													<TableCell>
														<Badge
															variant={
																STATUS_FUNCIONARIO_DATA[funcionario.status]
																	.variant
															}
														>
															{
																STATUS_FUNCIONARIO_DATA[funcionario.status]
																	.label
															}
														</Badge>
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
																	to="/admin/rh/funcionarios/$id"
																	params={{ id: funcionario.id.toString() }}
																>
																	<DropdownMenuItem>
																		<Eye className="h-4 w-4 mr-2" />
																		Visualizar
																	</DropdownMenuItem>
																</Link>
																<Link
																	to="/admin/rh/funcionarios/$id/edit"
																	params={{ id: funcionario.id.toString() }}
																>
																	<DropdownMenuItem>
																		<Pencil className="h-4 w-4 mr-2" />
																		Editar
																	</DropdownMenuItem>
																</Link>
																{funcionario.status ===
																	STATUS_FUNCIONARIO.ATIVO && (
																	<DropdownMenuItem
																		onClick={() =>
																			handleAlterarStatus(
																				funcionario.id,
																				STATUS_FUNCIONARIO.AVISO_PREVIO,
																			)
																		}
																		className="text-orange-600"
																	>
																		<UserX className="h-4 w-4 mr-2" />
																		Aviso Prévio
																	</DropdownMenuItem>
																)}
																{funcionario.status ===
																	STATUS_FUNCIONARIO.PERIODO_EXPERIENCIA && (
																	<DropdownMenuItem
																		onClick={() =>
																			handleAlterarStatus(
																				funcionario.id,
																				STATUS_FUNCIONARIO.ATIVO,
																			)
																		}
																		className="text-green-600"
																	>
																		<UserCheck className="h-4 w-4 mr-2" />
																		Efetivar
																	</DropdownMenuItem>
																)}
																{[
																	STATUS_FUNCIONARIO.AVISO_PREVIO,
																	STATUS_FUNCIONARIO.EM_CONTRATACAO,
																].includes(funcionario.status as any) && (
																	<DropdownMenuItem
																		onClick={() =>
																			handleAlterarStatus(
																				funcionario.id,
																				STATUS_FUNCIONARIO.DESLIGADO,
																			)
																		}
																		className="text-destructive"
																	>
																		<UserX className="h-4 w-4 mr-2" />
																		Desligar
																	</DropdownMenuItem>
																)}
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
															to: "/admin/rh/funcionarios",
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
															to: "/admin/rh/funcionarios",
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
