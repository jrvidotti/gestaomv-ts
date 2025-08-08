import { RouteGuard } from "@/components/auth/route-guard";
import { OperacoesTable } from "@/components/factoring/tables/operacoes-table";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/factoring/operacoes/")({
	component: OperacoesListPage,
});

function OperacoesListPage() {
	const trpc = useTRPC();

	// Buscar operações
	const {
		data: operacoes,
		isLoading,
		refetch,
	} = useQuery(
		trpc.factoring.operacoes.list.queryOptions({
			page: 1,
			limit: 20,
		}),
	);

	// Cancelar operação
	const { mutate: cancelarOperacao } = useMutation({
		...trpc.factoring.operacoes.cancelar.mutationOptions(),
		onSuccess: () => {
			toast.success("Operação cancelada com sucesso!");
			refetch();
		},
		onError: (error) => {
			toast.error(`Erro ao cancelar operação: ${error.message}`);
		},
	});

	const handleCancel = (uid: string) => {
		if (
			confirm(
				"Tem certeza que deseja cancelar esta operação? Esta ação não pode ser desfeita.",
			)
		) {
			cancelarOperacao({ uid });
		}
	};

	const header = (
		<PageHeader
			title="Operações"
			subtitle="Gerenciar operações de factoring"
			icon={<FileText className="h-5 w-5" />}
			actions={[
				<Button key="new-operacao" asChild>
					<Link to="/admin/factoring/operacoes/nova">
						<Plus className="h-4 w-4 mr-2" />
						Nova Operação
					</Link>
				</Button>,
			]}
		/>
	);

	return (
		<RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
			<AdminLayout header={header}>
				<Card>
					<CardContent className="p-6">
						<OperacoesTable
							data={operacoes?.data || []}
							isLoading={isLoading}
							onCancel={handleCancel}
						/>
					</CardContent>
				</Card>
			</AdminLayout>
		</RouteGuard>
	);
}
