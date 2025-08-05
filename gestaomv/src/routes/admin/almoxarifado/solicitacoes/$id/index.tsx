import {
	MateriaisVisualizacao,
	type MaterialVisualizacao,
} from "@/components/almoxarifado/materiais-visualizacao";
import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { STATUS_SOLICITACAO_DATA } from "@/modules/almoxarifado/consts";
import { STATUS_SOLICITACAO } from "@/modules/almoxarifado/enums";
import { USER_ROLES } from "@/modules/core/enums";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	Building2,
	Calendar,
	CheckCircle,
	ClipboardList,
	Info,
	MessageSquare,
	Package,
	Printer,
	User,
	XCircle,
} from "lucide-react";

export const Route = createFileRoute("/admin/almoxarifado/solicitacoes/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { user } = useAuth();
	const solicitacaoId = Number.parseInt(id, 10);

	const trpc = useTRPC();

	const {
		data: solicitacao,
		isLoading,
		error,
		refetch,
	} = useQuery(
		trpc.almoxarifado.solicitacoes.buscar.queryOptions({
			id: solicitacaoId,
		}),
	);

	const isAdmin = user?.roles?.includes(USER_ROLES.ADMIN);
	const isAprovador = user?.roles?.includes(USER_ROLES.APROVADOR_ALMOXARIFADO);
	const isGerente = user?.roles?.includes(USER_ROLES.GERENCIA_ALMOXARIFADO);
	const isOwner = user?.id === solicitacao?.solicitanteId;

	// Permissões derivadas
	const podeAprovarRejeitar = isAdmin || isAprovador;
	const podeAtender = isAdmin || isAprovador || isGerente;

	const { mutate: aprovarSolicitacao, isPending: aprovandoSolicitacao } =
		useMutation({
			...trpc.almoxarifado.solicitacoes.aprovarOuRejeitar.mutationOptions(),
			onSuccess: () => {
				refetch();
			},
		});

	const { mutate: cancelarSolicitacao, isPending: cancelandoSolicitacao } =
		useMutation({
			...trpc.almoxarifado.solicitacoes.cancelar.mutationOptions(),
			onSuccess: () => {
				refetch();
			},
		});

	const { mutate: atenderSolicitacao, isPending: atendendoSolicitacao } =
		useMutation({
			...trpc.almoxarifado.solicitacoes.atender.mutationOptions(),
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

	const handleAprovar = async () => {
		if (confirm("Deseja aprovar esta solicitação?")) {
			aprovarSolicitacao({
				id: solicitacaoId,
				data: { status: STATUS_SOLICITACAO.APROVADA },
			});
		}
	};

	const handleRejeitar = async () => {
		const motivo = prompt("Informe o motivo da rejeição (obrigatório):");
		if (motivo?.trim()) {
			aprovarSolicitacao({
				id: solicitacaoId,
				data: {
					status: STATUS_SOLICITACAO.REJEITADA,
					motivoRejeicao: motivo.trim(),
				},
			});
		} else if (motivo !== null) {
			alert("O motivo da rejeição é obrigatório.");
		}
	};

	const handleAtender = async () => {
		if (
			confirm(
				"Confirma que os materiais foram separados e as quantidades estão corretas?\n\nEsta ação marcará a solicitação como ATENDIDA.",
			)
		) {
			if (!solicitacao || !solicitacao.itens) {
				alert("Solicitação não encontrada ou sem itens");
				return;
			}

			const itensAtendimento = solicitacao.itens.map((item) => ({
				id: item.id,
				qtdAtendida: item.qtdSolicitada,
			}));

			atenderSolicitacao({
				id: solicitacaoId,
				data: {
					itens: itensAtendimento as any,
				},
			});
		}
	};

	const handleCancelar = async () => {
		if (confirm("Deseja cancelar esta solicitação?")) {
			cancelarSolicitacao({
				id: solicitacaoId,
			});
		}
	};

	const handlePrint = () => {
		window.open(
			`/admin/almoxarifado/solicitacoes/${solicitacaoId}/print`,
			"_blank",
		);
	};

	const header = (
		<PageHeader
			title={`Solicitação #${solicitacaoId.toString().padStart(6, "0")}`}
			subtitle="Detalhes da solicitação de material"
			onClickBack={() => window.history.back()}
			backButtonText="Voltar"
			actions={[
				<Button key="imprimir" variant="outline" onClick={handlePrint}>
					<Printer className="h-4 w-4 mr-2" />
					Imprimir
				</Button>,
				...(podeAprovarRejeitar &&
				solicitacao?.status === STATUS_SOLICITACAO.PENDENTE
					? [
							<Button
								key="aprovar"
								onClick={handleAprovar}
								disabled={aprovandoSolicitacao}
								className="bg-green-600 hover:bg-green-700"
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								Aprovar
							</Button>,
							<Button
								key="rejeitar"
								variant="destructive"
								onClick={handleRejeitar}
								disabled={aprovandoSolicitacao}
							>
								<XCircle className="h-4 w-4 mr-2" />
								Rejeitar
							</Button>,
						]
					: []),
				...(podeAtender && solicitacao?.status === STATUS_SOLICITACAO.APROVADA
					? [
							<Button
								key="atender"
								onClick={handleAtender}
								disabled={atendendoSolicitacao}
								className="bg-green-600 hover:bg-green-700"
							>
								<Package className="h-4 w-4 mr-2" />
								{atendendoSolicitacao ? "Atendendo..." : "Atender"}
							</Button>,
						]
					: []),
				...(isOwner && solicitacao?.status === STATUS_SOLICITACAO.PENDENTE
					? [
							<Button
								key="cancelar"
								variant="outline"
								onClick={handleCancelar}
								disabled={cancelandoSolicitacao}
							>
								<XCircle className="h-4 w-4 mr-2" />
								{cancelandoSolicitacao ? "Cancelando..." : "Cancelar"}
							</Button>,
						]
					: []),
			]}
		/>
	);

	if (isLoading) {
		return (
			<RouteGuard
				requiredRoles={[
					USER_ROLES.ADMIN,
					USER_ROLES.APROVADOR_ALMOXARIFADO,
					USER_ROLES.GERENCIA_ALMOXARIFADO,
					USER_ROLES.USUARIO_ALMOXARIFADO,
				]}
			>
				<AdminLayout header={header}>
					<div className="flex items-center justify-center h-32">
						<div className="text-muted-foreground">
							Carregando solicitação...
						</div>
					</div>
				</AdminLayout>
			</RouteGuard>
		);
	}

	if (error || !solicitacao) {
		return (
			<RouteGuard
				requiredRoles={[
					USER_ROLES.ADMIN,
					USER_ROLES.APROVADOR_ALMOXARIFADO,
					USER_ROLES.GERENCIA_ALMOXARIFADO,
					USER_ROLES.USUARIO_ALMOXARIFADO,
				]}
			>
				<AdminLayout header={header}>
					<Card>
						<CardContent className="pt-6">
							<div className="text-center py-8">
								<ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									Solicitação não encontrada
								</h3>
								<p className="text-muted-foreground mb-4">
									A solicitação que você está procurando não existe ou foi
									removida.
								</p>
								<Link
									to="/admin/almoxarifado/solicitacoes"
									search={{ pagina: 1, limite: 20 }}
								>
									<Button>
										<ArrowLeft className="h-4 w-4 mr-2" />
										Voltar para Solicitações
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</AdminLayout>
			</RouteGuard>
		);
	}

	// Transformar itens da solicitação para o formato do componente MateriaisVisualizacao
	const materiaisVisualizacao: MaterialVisualizacao[] =
		solicitacao.itens?.map((item) => {
			const material = item.material as {
				id?: number;
				nome?: string;
				foto?: string | null;
				valorUnitario?: number;
				tipoMaterial?: { nome: string };
				unidadeMedida?: { nome: string };
			};

			return {
				id: item.id, // ID do item da solicitação
				materialId: material?.id || 0,
				nome: material?.nome || "Material não encontrado",
				foto: material?.foto || null,
				tipoMaterial: material?.tipoMaterial
					? { nome: material.tipoMaterial.nome }
					: null,
				unidadeMedida: material?.unidadeMedida
					? { nome: material.unidadeMedida.nome }
					: null,
				valorUnitario: material?.valorUnitario || 0,
				qtdSolicitada: item.qtdSolicitada || 0,
				qtdAtendida: item.qtdAtendida || null,
			};
		}) || [];

	return (
		<RouteGuard
			requiredRoles={[
				USER_ROLES.ADMIN,
				USER_ROLES.GERENCIA_ALMOXARIFADO,
				USER_ROLES.USUARIO_ALMOXARIFADO,
			]}
		>
			<AdminLayout header={header}>
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Informações Principais */}
					<Card>
						<CardContent className="space-y-4">
							<div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">Status Atual:</span>
										<Badge
											variant={
												STATUS_SOLICITACAO_DATA[solicitacao.status].variant
											}
											className="text-sm"
										>
											{STATUS_SOLICITACAO_DATA[solicitacao.status].label}
										</Badge>
									</div>

									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">Data da Solicitação</p>
											<p className="text-sm text-muted-foreground">
												{formatDateTime(solicitacao.dataOperacao)}
											</p>
										</div>
										{(solicitacao.dataAprovacao ||
											solicitacao.dataAtendimento) && (
											<Tooltip>
												<TooltipTrigger asChild>
													<Info className="h-4 w-4 text-secondary hover:text-primary cursor-help" />
												</TooltipTrigger>
												<TooltipContent side="right" className="max-w-sm">
													<div className="space-y-2">
														{solicitacao.dataAprovacao && (
															<div className="flex items-center gap-2">
																<CheckCircle className="h-3 w-3 text-green-600" />
																<div>
																	<p className="text-xs font-medium">
																		Aprovada em:
																	</p>
																	<p className="text-xs">
																		{formatDateTime(solicitacao.dataAprovacao)}
																	</p>
																</div>
															</div>
														)}
														{solicitacao.dataAtendimento && (
															<div className="flex items-center gap-2">
																<Package className="h-3 w-3 text-blue-600" />
																<div>
																	<p className="text-xs font-medium">
																		Atendida em:
																	</p>
																	<p className="text-xs">
																		{formatDateTime(
																			solicitacao.dataAtendimento,
																		)}
																	</p>
																</div>
															</div>
														)}
													</div>
												</TooltipContent>
											</Tooltip>
										)}
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<User className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">Solicitante</p>
											<p className="text-sm text-muted-foreground">
												{solicitacao.solicitante?.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{solicitacao.solicitante?.email}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Building2 className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">Unidade de Destino</p>
											<p className="text-sm text-muted-foreground">
												{solicitacao.unidade?.nome || "Não informado"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Observações */}
					{solicitacao.observacoes && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MessageSquare className="h-5 w-5" />
									Observações
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground whitespace-pre-wrap">
									{solicitacao.observacoes}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Lista de Materiais */}
					<MateriaisVisualizacao
						materiais={materiaisVisualizacao}
						titulo="Materiais Solicitados"
						mostrarValorTotal={true}
						solicitacaoStatus={solicitacao.status}
						podeEditar={podeAtender}
						isAprovador={isAdmin || isAprovador}
						onAtualizacao={refetch}
					/>
				</div>
			</AdminLayout>
		</RouteGuard>
	);
}
