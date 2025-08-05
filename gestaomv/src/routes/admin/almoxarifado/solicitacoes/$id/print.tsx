import { MateriaisImpressao } from "@/components/almoxarifado/materiais-impressao";
import type { MaterialVisualizacao } from "@/components/almoxarifado/materiais-visualizacao";
import { RouteGuard } from "@/components/auth/route-guard";
import { useTRPC } from "@/integrations/trpc/react";
import { STATUS_SOLICITACAO_DATA } from "@/modules/almoxarifado/consts";
import { USER_ROLES } from "@/modules/core/enums";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import styles from "./print.module.css";

export const Route = createFileRoute(
	"/admin/almoxarifado/solicitacoes/$id/print",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const solicitacaoId = Number.parseInt(id, 10);

	const trpc = useTRPC();

	const {
		data: solicitacao,
		isLoading,
		error,
	} = useQuery(
		trpc.almoxarifado.solicitacoes.buscar.queryOptions({
			id: solicitacaoId,
		}),
	);

	// Auto-imprimir quando a página carregar
	useEffect(() => {
		if (solicitacao && !isLoading) {
			const timer = setTimeout(() => {
				window.print();
			}, 500); // Pequeno delay para garantir que a página foi renderizada

			return () => clearTimeout(timer);
		}
	}, [solicitacao, isLoading]);

	const formatDateTime = (date: string | Date) => {
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

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
				<div className={styles.printLoading}>
					<p>Preparando impressão...</p>
				</div>
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
				<div className={styles.printError}>
					<h2>Solicitação não encontrada</h2>
					<p>
						A solicitação que você está tentando imprimir não existe ou foi
						removida.
					</p>
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button onClick={() => window.close()}>Fechar</button>
				</div>
			</RouteGuard>
		);
	}

	// Transformar itens da solicitação para o formato do componente
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
				id: item.id,
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
			<div className={styles.printContainer}>
				{/* Cabeçalho */}
				<header className={styles.printHeader}>
					<div className={styles.requestInfo}>
						<div className={styles.companyName}>Gestão MV</div>
						<div className={styles.infoValue}>{formatDateTime(new Date())}</div>
					</div>
					<div className={styles.requestInfo}>
						<div className={styles.requestNumber}>
							Almoxarifado - Solicitação de Material #
							{solicitacaoId.toString().padStart(6, "0")}
						</div>
						<div className={styles.requestStatus}>
							{STATUS_SOLICITACAO_DATA[solicitacao.status].label}
						</div>
					</div>
				</header>

				{/* Informações da Solicitação */}
				<section className={styles.printSection}>
					<div className={styles.infoGrid}>
						<div className={styles.infoItem}>
							<span className={styles.infoLabel}>Data da Solicitação</span>
							<span className={styles.infoValue}>
								{formatDateTime(solicitacao.dataOperacao)}
							</span>
						</div>
						<div className={styles.infoItem}>
							<span className={styles.infoLabel}>Solicitante</span>
							<span className={styles.infoValue}>
								{solicitacao.solicitante?.name}
							</span>
						</div>
						<div className={styles.infoItem}>
							<span className={styles.infoLabel}>Unidade de Destino</span>
							<span className={styles.infoValue}>
								{solicitacao.unidade?.nome || "Não informado"}
							</span>
						</div>
					</div>
				</section>

				{/* Observações */}
				{solicitacao.observacoes && (
					<section className={styles.printSection}>
						<h2 className={styles.sectionTitle}>Observações</h2>
						<div className={styles.observations}>{solicitacao.observacoes}</div>
					</section>
				)}

				{/* Lista de Materiais */}
				<MateriaisImpressao
					materiais={materiaisVisualizacao}
					titulo="Materiais Solicitados"
					mostrarValorTotal={true}
					styles={styles}
				/>
			</div>
		</RouteGuard>
	);
}
