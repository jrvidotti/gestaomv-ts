import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { OperacaoForm } from "@/components/factoring/forms/operacao-form";
import { Button } from "@/components/ui/button";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/factoring/operacoes/$uid/editar")({
  component: EditarOperacaoPage,
});

function EditarOperacaoPage() {
  const navigate = useNavigate();
  const { uid } = Route.useParams();
  const trpc = useTRPC();

  // Buscar dados da operação
  const {
    data: operacao,
    isLoading: isLoadingOperacao,
    refetch,
  } = useQuery(
    trpc.factoring.operacoes.buscar.queryOptions({
      uid,
    }),
  );

  // Atualizar operação
  const { mutate: updateOperacao, isPending } = useMutation({
    ...trpc.factoring.operacoes.atualizar.mutationOptions(),
    onSuccess: () => {
      toast.success("Operação atualizada com sucesso!");
      navigate({
        to: "/admin/factoring/operacoes/$uid",
        params: { uid },
      });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar operação: ${error.message}`);
    },
  });

  // Calcular valores
  const { mutate: calcularOperacao } = useMutation({
    ...trpc.factoring.operacoes.calcular.mutationOptions(),
    onSuccess: (data) => {
      toast.success(`Valor calculado: R$ ${data.valorLiquido.toFixed(2)}`);
      // Aqui você poderia atualizar o formulário com o valor calculado
    },
    onError: (error) => {
      toast.error(`Erro no cálculo: ${error.message}`);
    },
  });

  const handleSubmit = (data: any) => {
    // Ajustar dados antes de enviar
    const submitData = {
      uid,
      ...data,
      dataVencimento: data.dataVencimento 
        ? new Date(data.dataVencimento) 
        : undefined,
    };
    updateOperacao(submitData);
  };

  const handleCancel = () => {
    navigate({
      to: "/admin/factoring/operacoes/$uid",
      params: { uid },
    });
  };

  const handleCalcular = (taxaJuros: number, valorBruto: number) => {
    calcularOperacao({
      taxaJuros,
      valorBruto,
    });
  };

  const header = (
    <PageHeader
      title="Editar Operação"
      subtitle={operacao ? `Editando ${operacao.uid}` : "Carregando..."}
      icon={<FileText className="h-5 w-5" />}
      actions={[
        <Button key="back" asChild variant="outline">
          <Link to="/admin/factoring/operacoes/$uid" params={{ uid }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>,
      ]}
    />
  );

  if (isLoadingOperacao) {
    return (
      <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
        <AdminLayout header={header}>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  if (!operacao) {
    return (
      <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
        <AdminLayout header={header}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Operação não encontrada</h3>
              <p className="text-muted-foreground mb-4">
                A operação que você está procurando não existe.
              </p>
              <Button asChild>
                <Link to="/admin/factoring/operacoes">Voltar à lista</Link>
              </Button>
            </div>
          </div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  // Verificar se a operação pode ser editada
  if (operacao.status !== "rascunho") {
    return (
      <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
        <AdminLayout header={header}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Operação não pode ser editada</h3>
              <p className="text-muted-foreground mb-4">
                Apenas operações em rascunho podem ser editadas.
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline">
                  <Link to="/admin/factoring/operacoes">Voltar à lista</Link>
                </Button>
                <Button asChild>
                  <Link to="/admin/factoring/operacoes/$uid" params={{ uid }}>
                    Ver detalhes
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  // Preparar dados iniciais para o formulário
  const initialData = {
    uid: operacao.uid,
    status: operacao.status,
    clienteId: operacao.clienteId,
    carteiraId: operacao.carteiraId,
    taxaJuros: operacao.taxaJuros,
    valorLiquido: operacao.valorLiquido || undefined,
    dataVencimento: operacao.dataVencimento 
      ? new Date(operacao.dataVencimento).toISOString().split('T')[0] 
      : "",
    observacoes: operacao.observacoes || "",
  };

  return (
    <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="max-w-4xl mx-auto">
          <OperacaoForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onCalcular={handleCalcular}
            isLoading={isPending}
          />
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}