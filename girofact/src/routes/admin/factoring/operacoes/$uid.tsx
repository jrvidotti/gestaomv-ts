import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  FileText, 
  Edit, 
  ArrowLeft, 
  Users, 
  Calendar, 
  DollarSign,
  CreditCard,
  X,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/factoring/operacoes/$uid")({
  component: OperacaoDetailsPage,
});

const statusConfig = {
  rascunho: {
    label: "Rascunho",
    variant: "secondary" as const,
    icon: <Edit className="h-4 w-4" />,
  },
  aprovacao: {
    label: "Em Aprovação",
    variant: "outline" as const,
    icon: <Clock className="h-4 w-4" />,
  },
  efetivada: {
    label: "Efetivada",
    variant: "default" as const,
    icon: <CheckCircle className="h-4 w-4" />,
  },
  liquidada: {
    label: "Liquidada",
    variant: "default" as const,
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelada: {
    label: "Cancelada",
    variant: "destructive" as const,
    icon: <X className="h-4 w-4" />,
  },
};

function OperacaoDetailsPage() {
  const { uid } = Route.useParams();
  const trpc = useTRPC();
  const navigate = useNavigate();

  // Buscar dados da operação
  const {
    data: operacao,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.factoring.operacoes.findByUid.queryOptions({
      uid,
    }),
  );

  // TODO: Implementar método aprovar no router
  // const { mutate: aprovarOperacao, isPending: isApproving } = useMutation({
  //   ...trpc.factoring.operacoes.aprovar.mutationOptions(),
  //   onSuccess: () => {
  //     toast.success("Operação aprovada com sucesso!");
  //     refetch();
  //   },
  //   onError: (error) => {
  //     toast.error(`Erro ao aprovar operação: ${error.message}`);
  //   },
  // });

  // Efetivar operação
  const { mutate: efetivarOperacao, isPending: isEffective } = useMutation({
    ...trpc.factoring.operacoes.efetivar.mutationOptions(),
    onSuccess: () => {
      toast.success("Operação efetivada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao efetivar operação: ${error.message}`);
    },
  });

  // Liquidar operação
  const { mutate: liquidarOperacao, isPending: isLiquidating } = useMutation({
    ...trpc.factoring.operacoes.liquidar.mutationOptions(),
    onSuccess: () => {
      toast.success("Operação liquidada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao liquidar operação: ${error.message}`);
    },
  });

  // Cancelar operação
  const { mutate: cancelarOperacao, isPending: isCanceling } = useMutation({
    ...trpc.factoring.operacoes.cancelar.mutationOptions(),
    onSuccess: () => {
      toast.success("Operação cancelada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao cancelar operação: ${error.message}`);
    },
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const handleAprovar = () => {
    if (confirm("Tem certeza que deseja aprovar esta operação?")) {
      aprovarOperacao({ uid });
    }
  };

  const handleEfetivar = () => {
    if (confirm("Tem certeza que deseja efetivar esta operação?")) {
      efetivarOperacao({ uid });
    }
  };

  const handleLiquidar = () => {
    if (confirm("Tem certeza que deseja liquidar esta operação?")) {
      liquidarOperacao({ uid });
    }
  };

  const handleCancelar = () => {
    if (confirm("Tem certeza que deseja cancelar esta operação? Esta ação não pode ser desfeita.")) {
      cancelarOperacao({ uid });
    }
  };

  const getActionButtons = () => {
    if (!operacao) return [];

    const buttons = [];
    const isPending = isApproving || isEffective || isLiquidating || isCanceling;

    // Botão Editar (apenas para rascunho)
    if (operacao.status === "rascunho") {
      buttons.push(
        <Button key="edit" asChild>
          <Link to="/admin/factoring/operacoes/$uid/editar" params={{ uid }}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      );
    }

    // Botões de ação baseados no status
    switch (operacao.status) {
      case "rascunho":
        buttons.push(
          <Button 
            key="approve" 
            onClick={handleAprovar} 
            disabled={isPending}
            variant="default"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar
          </Button>
        );
        break;
      case "aprovacao":
        buttons.push(
          <Button 
            key="effective" 
            onClick={handleEfetivar} 
            disabled={isPending}
            variant="default"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Efetivar
          </Button>
        );
        break;
      case "efetivada":
        buttons.push(
          <Button 
            key="liquidate" 
            onClick={handleLiquidar} 
            disabled={isPending}
            variant="default"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Liquidar
          </Button>
        );
        break;
    }

    // Botão Cancelar (para status que permitem cancelamento)
    if (["rascunho", "aprovacao", "efetivada"].includes(operacao.status)) {
      buttons.push(
        <Button 
          key="cancel" 
          onClick={handleCancelar} 
          disabled={isPending}
          variant="destructive"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      );
    }

    return buttons;
  };

  const header = (
    <PageHeader
      title="Detalhes da Operação"
      subtitle={operacao ? `Protocolo: ${operacao.uid}` : "Carregando..."}
      icon={<FileText className="h-5 w-5" />}
      actions={[
        <Button key="back" asChild variant="outline">
          <Link to="/admin/factoring/operacoes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>,
        ...getActionButtons(),
      ]}
    />
  );

  if (isLoading) {
    return (
      <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
        <AdminLayout header={header}>
          <div className="max-w-4xl mx-auto space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  if (error || !operacao) {
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

  const statusInfo = statusConfig[operacao.status];

  return (
    <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status e Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações da Operação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant={statusInfo.variant} className="gap-1">
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Protocolo
                  </label>
                  <div className="mt-1 font-mono">
                    {operacao.uid}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Taxa de Juros
                  </label>
                  <div className="mt-1 text-lg font-medium">
                    {operacao.taxaJuros.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Valor Líquido
                  </label>
                  <div className="mt-1 text-lg font-medium">
                    {formatCurrency(operacao.valorLiquido)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data de Vencimento
                  </label>
                  <div className="mt-1">
                    {formatDate(operacao.dataVencimento)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Criado em
                  </label>
                  <div className="mt-1">
                    {formatDate(operacao.criadoEm)}
                  </div>
                </div>
              </div>

              {operacao.dataAprovacao && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Data de Aprovação
                  </label>
                  <div className="mt-1">
                    {formatDate(operacao.dataAprovacao)}
                  </div>
                </div>
              )}

              {operacao.dataPagamento && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Data de Pagamento
                  </label>
                  <div className="mt-1">
                    {formatDate(operacao.dataPagamento)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome/Razão Social
                  </label>
                  <div className="mt-1 font-medium">
                    {operacao.cliente.pessoa.nomeRazaoSocial}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Documento
                  </label>
                  <div className="mt-1 font-mono">
                    {operacao.cliente.pessoa.documento}
                  </div>
                </div>
              </div>

              {operacao.cliente.pessoa.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    E-mail
                  </label>
                  <div className="mt-1">
                    <a 
                      href={`mailto:${operacao.cliente.pessoa.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {operacao.cliente.pessoa.email}
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link 
                    to="/admin/factoring/pessoas/$id" 
                    params={{ id: operacao.cliente.pessoa.id.toString() }}
                  >
                    Ver detalhes do cliente
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Carteira */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Carteira
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome da Carteira
                  </label>
                  <div className="mt-1 font-medium">
                    {operacao.carteira.nome}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Banco
                  </label>
                  <div className="mt-1">
                    {operacao.carteira.banco}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Agência
                  </label>
                  <div className="mt-1 font-mono">
                    {operacao.carteira.agencia}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Conta
                  </label>
                  <div className="mt-1 font-mono">
                    {operacao.carteira.conta}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {operacao.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">
                  {operacao.observacoes}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}