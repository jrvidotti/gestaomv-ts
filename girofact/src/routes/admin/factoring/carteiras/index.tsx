import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { CarteirasTable } from "@/components/factoring/tables/carteiras-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/factoring/carteiras/")({
  component: CarteirasListPage,
});

function CarteirasListPage() {
  const trpc = useTRPC();

  // Buscar carteiras
  const {
    data: carteiras,
    isLoading,
    refetch,
  } = useQuery(
    trpc.factoring.carteiras.listar.queryOptions(),
  );

  // Deletar carteira
  const { mutate: deleteCarteira } = useMutation({
    ...trpc.factoring.carteiras.remover.mutationOptions(),
    onSuccess: () => {
      toast.success("Carteira removida com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao remover carteira: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    if (
      confirm(
        "Tem certeza que deseja excluir esta carteira? Esta ação não pode ser desfeita.",
      )
    ) {
      deleteCarteira({ id });
    }
  };

  const header = (
    <PageHeader
      title="Carteiras"
      subtitle="Gerenciar carteiras de pagamento e recebimento"
      icon={<Wallet className="h-5 w-5" />}
      actions={[
        <Button key="new-carteira" asChild>
          <Link to="/admin/factoring/carteiras/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Carteira
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
            <CarteirasTable
              data={carteiras || []}
              isLoading={isLoading}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </AdminLayout>
    </RouteGuard>
  );
}