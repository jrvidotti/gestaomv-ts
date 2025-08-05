"use client";

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
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/trpc";
import {
	STATUS_OPTIONS,
	STATUS_SOLICITACAO,
	STATUS_SOLICITACAO_DATA,
	StatusSolicitacaoType,
} from "@/shared";
import { USER_ROLES } from "@/shared/constants/user-roles";
import {
	CheckCircle,
	ClipboardList,
	Eye,
	Filter,
	MoreHorizontal,
	Package,
	Plus,
	Search,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SolicitacoesPage() {
	const { user } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [busca, setBusca] = useState("");
	const [statusSelecionado, setStatusSelecionado] = useState<
		StatusSolicitacaoType | "all"
	>("all");
	const [paginaAtual, setPaginaAtual] = useState(1);

	const buscaDebounced = useDebounce(busca, 300);

	// Aplicar filtros da URL quando o componente carrega
	useEffect(() => {
		const statusFromUrl = searchParams.get("status");
		if (statusFromUrl && statusFromUrl !== statusSelecionado) {
			setStatusSelecionado(statusFromUrl as StatusSolicitacaoType);
		}
	}, [searchParams, statusSelecionado]);

	const filtros = {
		status:
			statusSelecionado && statusSelecionado !== "all"
				? statusSelecionado
				: undefined,
		pagina: paginaAtual,
		limite: 20,
	};

	const { data, isLoading, refetch } =
		api.almoxarifado.listarSolicitacoes.useQuery(filtros);

	const aprovarSolicitacao =
		api.almoxarifado.aprovarOuRejeitarSolicitacao.useMutation({
			onSuccess: () => {
				refetch();
			},
		});

	const atenderSolicitacao = api.almoxarifado.atenderSolicitacao.useMutation({
		onSuccess: () => {
			refetch();
		},
	});

	const formatDateTime = (date: string | Date) => {
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

	const handleAprovar = async (id: number) => {
		if (confirm("Deseja aprovar esta solicitação?")) {
			try {
				await aprovarSolicitacao.mutateAsync({
					id,
					data: { status: STATUS_SOLICITACAO.APROVADA },
				});
			} catch (error) {
				console.error("Erro ao aprovar solicitação:", error);
			}
		}
	};

	const handleRejeitar = async (id: number) => {
		const motivo = prompt("Informe o motivo da rejeição (obrigatório):");
		if (motivo && motivo.trim()) {
			try {
				await aprovarSolicitacao.mutateAsync({
					id,
					data: {
						status: STATUS_SOLICITACAO.REJEITADA,
						motivoRejeicao: motivo.trim(),
					},
				});
			} catch (error) {
				console.error("Erro ao rejeitar solicitação:", error);
			}
		} else if (motivo !== null) {
			alert("O motivo da rejeição é obrigatório.");
		}
	};

	const handleAtender = async (id: number) => {
		if (
			confirm(
				"Confirma que os materiais foram separados e as quantidades estão corretas?\n\nEsta ação marcará a solicitação como ATENDIDA.",
			)
		) {
			try {
				const solicitacao = data?.solicitacoes.find((s) => s.id === id);
				if (!solicitacao || !solicitacao.itens) {
					throw new Error("Solicitação não encontrada ou sem itens");
				}

				const itensAtendimento = solicitacao.itens.map((item) => ({
					id: item.id,
					qtdAtendida: item.qtdSolicitada,
				}));

				await atenderSolicitacao.mutateAsync({
					id,
					data: {
						itens: itensAtendimento,
					},
				});
			} catch (error) {
				console.error("Erro ao atender solicitação:", error);
			}
		}
	};

	const limparFiltros = () => {
		setBusca("");
		setStatusSelecionado("all");
		setPaginaAtual(1);
	};

	const totalPaginas = data ? Math.ceil(data.total / filtros.limite) : 0;
	const isAdmin =
		user?.roles?.includes(USER_ROLES.ADMIN) ||
		user?.roles?.includes(USER_ROLES.GERENCIA_ALMOXARIFADO);

	const obterSubtitle = () => {
		let subtitle = "Acompanhe e gerencie todas as solicitações do almoxarifado";
		if (statusSelecionado && statusSelecionado !== "all") {
			const statusOption = STATUS_OPTIONS.find(
				(s) => s.value === statusSelecionado,
			);
			subtitle += ` • Filtro: ${statusOption?.label || statusSelecionado}`;
		}
		return subtitle;
	};

	const header = (
		<PageHeader
			title="Solicitações de Material"
			subtitle={obterSubtitle()}
			actions={[
				<Link
					key="nova-solicitacao"
					href="/admin/almoxarifado/solicitacoes/nova"
				>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Nova Solicitação
					</Button>
				</Link>,
			]}
		/>
	);

	return (
		<RouteGuard
			requiredRoles={[
				USER_ROLES.ADMIN,
				USER_ROLES.GERENCIA_ALMOXARIFADO,
				USER_ROLES.USUARIO_ALMOXARIFADO,
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
								Use os filtros abaixo para encontrar solicitações específicas
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4 md:flex-row md:items-end">
								<div className="flex-1">
									<label
										htmlFor="busca"
										className="text-sm font-medium mb-2 block"
									>
										Buscar por ID
									</label>
									<div className="relative">
										<Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
										<Input
											id="busca"
											placeholder="Buscar por número da solicitação..."
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
											setStatusSelecionado(value as StatusSolicitacaoType)
										}
									>
										<SelectTrigger className="w-48">
											<SelectValue placeholder="Todos os status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos os status</SelectItem>
											{STATUS_OPTIONS.map((status) => (
												<SelectItem key={status.value} value={status.value}>
													{status.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<Button variant="outline" onClick={limparFiltros}>
									Limpar Filtros
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Tabela de Solicitações */}
					<Card>
						<CardHeader>
							<CardTitle>Solicitações</CardTitle>
							<CardDescription>
								{isLoading
									? "Carregando..."
									: `${data?.total || 0} solicitações encontradas`}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<p className="text-muted-foreground">
										Carregando solicitações...
									</p>
								</div>
							) : !data?.solicitacoes.length ? (
								<div className="text-center py-8">
									<ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">
										Nenhuma solicitação encontrada
									</h3>
									<p className="text-muted-foreground mb-4">
										{statusSelecionado
											? "Tente ajustar os filtros para encontrar solicitações."
											: "Comece criando sua primeira solicitação de material."}
									</p>
									{!statusSelecionado && (
										<Link href="/admin/almoxarifado/solicitacoes/nova">
											<Button>
												<Plus className="h-4 w-4 mr-2" />
												Criar Primeira Solicitação
											</Button>
										</Link>
									)}
								</div>
							) : (
								<>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Solicitação</TableHead>
												<TableHead>Solicitante</TableHead>
												<TableHead>Unidade</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Data</TableHead>
												<TableHead>Itens</TableHead>
												<TableHead className="w-[100px]">Ações</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.solicitacoes.map((solicitacao) => (
												<TableRow key={solicitacao.id}>
													<TableCell className="font-mono">
														#{solicitacao.id.toString().padStart(6, "0")}
													</TableCell>
													<TableCell>
														<div>
															<p className="font-medium">
																{solicitacao.solicitante?.name}
															</p>
															<p className="text-sm text-muted-foreground">
																{solicitacao.solicitante?.email}
															</p>
														</div>
													</TableCell>
													<TableCell>
														{solicitacao.unidade?.nome || "N/A"}
													</TableCell>
													<TableCell>
														<Badge
															variant={
																STATUS_SOLICITACAO_DATA[solicitacao.status]
																	.variant
															}
														>
															{
																STATUS_SOLICITACAO_DATA[solicitacao.status]
																	.label
															}
														</Badge>
													</TableCell>
													<TableCell className="text-sm">
														{formatDateTime(solicitacao.dataOperacao)}
													</TableCell>
													<TableCell>
														<div className="text-sm">
															<p>{solicitacao.itens?.length || 0} itens</p>
															<p className="text-muted-foreground">
																{solicitacao.itens?.reduce(
																	(acc, item) => acc + item.qtdSolicitada,
																	0,
																) || 0}{" "}
																unidades
															</p>
														</div>
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
																	href={`/admin/almoxarifado/solicitacoes/${solicitacao.id}`}
																>
																	<DropdownMenuItem>
																		<Eye className="h-4 w-4 mr-2" />
																		Visualizar
																	</DropdownMenuItem>
																</Link>
																{isAdmin &&
																	solicitacao.status ===
																		STATUS_SOLICITACAO.PENDENTE && (
																		<>
																			<DropdownMenuItem
																				onClick={() =>
																					handleAprovar(solicitacao.id)
																				}
																				className="text-green-600"
																			>
																				<CheckCircle className="h-4 w-4 mr-2" />
																				Aprovar
																			</DropdownMenuItem>
																			<DropdownMenuItem
																				onClick={() =>
																					handleRejeitar(solicitacao.id)
																				}
																				className="text-destructive"
																			>
																				<XCircle className="h-4 w-4 mr-2" />
																				Rejeitar
																			</DropdownMenuItem>
																		</>
																	)}
																{isAdmin &&
																	solicitacao.status ===
																		STATUS_SOLICITACAO.APROVADA && (
																		<DropdownMenuItem
																			onClick={() =>
																				handleAtender(solicitacao.id)
																			}
																			className="text-green-600"
																		>
																			<Package className="h-4 w-4 mr-2" />
																			Atender
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
													onClick={() =>
														setPaginaAtual((prev) => Math.max(1, prev - 1))
													}
													disabled={paginaAtual === 1}
												>
													Anterior
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														setPaginaAtual((prev) =>
															Math.min(totalPaginas, prev + 1),
														)
													}
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
