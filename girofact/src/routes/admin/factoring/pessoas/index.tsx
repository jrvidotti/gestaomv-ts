import { RouteGuard } from "@/components/auth/route-guard";
import { PessoasTable } from "@/components/factoring/tables/pessoas-table";
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

export const Route = createFileRoute("/admin/factoring/pessoas/")({
	component: PessoasListPage,
});

function PessoasListPage() {
	const trpc = useTRPC();

	// Buscar pessoas
	const {
		data: pessoas,
		isLoading,
		refetch,
	} = useQuery(
		trpc.factoring.pessoas.list.queryOptions({
			page: 1,
			limit: 20,
		}),
	);

	// Deletar pessoa
	const { mutate: deletePessoa } = useMutation({
		...trpc.factoring.pessoas.delete.mutationOptions(),
		onSuccess: () => {
			toast.success("Pessoa removida com sucesso!");
			refetch();
		},
		onError: (error) => {
			toast.error(`Erro ao remover pessoa: ${error.message}`);
		},
	});

	const handleDelete = (id: number) => {
		if (
			confirm(
				"Tem certeza que deseja excluir esta pessoa? Esta ação não pode ser desfeita.",
			)
		) {
			deletePessoa({ id });
		}
	};

	const header = (
		<PageHeader
			title="Pessoas"
			subtitle="Gerenciar cadastro de pessoas físicas e jurídicas"
			icon={<Users className="h-5 w-5" />}
			actions={[
				<Button key="new-pessoa" asChild>
					<Link to="/admin/factoring/pessoas/nova">
						<Plus className="h-4 w-4 mr-2" />
						Nova Pessoa
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
						<PessoasTable
							data={pessoas?.data || []}
							isLoading={isLoading}
							onDelete={handleDelete}
						/>
					</CardContent>
				</Card>
			</AdminLayout>
		</RouteGuard>
	);
}
