import { RouteGuard } from "@/components/auth/route-guard";
import { ClientesTable } from "@/components/factoring/tables/clientes-table";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/factoring/clientes/")({
	component: ClientesListPage,
});

function ClientesListPage() {
	const trpc = useTRPC();

	// Buscar clientes
	const {
		data: clientes,
		isLoading,
		refetch,
	} = useQuery(
		trpc.factoring.clientes.list.queryOptions({
			page: 1,
			limit: 20,
		}),
	);

	// Deletar cliente
	const { mutate: deleteCliente } = useMutation({
		...trpc.factoring.clientes.delete.mutationOptions(),
		onSuccess: () => {
			toast.success("Cliente removido com sucesso!");
			refetch();
		},
		onError: (error) => {
			toast.error(`Erro ao remover cliente: ${error.message}`);
		},
	});

	const handleDelete = (id: number) => {
		if (
			confirm(
				"Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.",
			)
		) {
			deleteCliente({ id });
		}
	};

	const header = (
		<PageHeader
			title="Clientes"
			subtitle="Gerenciar clientes do sistema de factoring"
			icon={<Users className="h-5 w-5" />}
			actions={[
				<Button key="new-cliente" asChild>
					<Link to="/admin/factoring/clientes/novo">
						<Plus className="h-4 w-4 mr-2" />
						Novo Cliente
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
						<ClientesTable
							data={clientes?.data || []}
							isLoading={isLoading}
							onDelete={handleDelete}
						/>
					</CardContent>
				</Card>
			</AdminLayout>
		</RouteGuard>
	);
}
