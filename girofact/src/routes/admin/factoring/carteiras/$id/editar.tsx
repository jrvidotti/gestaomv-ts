import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { CarteiraForm } from "@/components/factoring/forms/carteira-form";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Wallet, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/factoring/carteiras/$id/editar")({
  component: EditarCarteiraPage,
});

function EditarCarteiraPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();

  // Buscar carteira
  const {
    data: carteira,
    isLoading: isLoadingCarteira,
    error,
  } = useQuery(
    trpc.factoring.carteiras.findById.queryOptions({ id: Number(id) }),
  );

  // Atualizar carteira
  const { mutate: updateCarteira, isPending } = useMutation({
    ...trpc.factoring.carteiras.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Carteira atualizada com sucesso!");
      navigate({
        to: "/admin/factoring/carteiras",
      });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar carteira: ${error.message}`);
    },
  });

  const handleSubmit = (data: any) => {
    updateCarteira({ id: Number(id), ...data });
  };

  const handleCancel = () => {
    navigate({
      to: "/admin/factoring/carteiras",
    });
  };

  const header = (
    <PageHeader
      title="Editar Carteira"
      subtitle={carteira ? `Editando: ${carteira.nome}` : "Carregando..."}
      icon={<Wallet className="h-5 w-5" />}
      actions={[
        <Button key="back" asChild variant="outline">
          <Link to="/admin/factoring/carteiras">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>,
      ]}
    />
  );

  if (isLoadingCarteira) {
    return (
      <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
        <AdminLayout header={header}>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                  Carregando carteira...
                </div>
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  if (error || !carteira) {
    return (
      <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
        <AdminLayout header={header}>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-red-600">
                  Erro ao carregar carteira: {error?.message || "Carteira não encontrada"}
                </div>
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="max-w-2xl mx-auto">
          <CarteiraForm
            mode="edit"
            initialData={carteira}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isPending}
          />
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}