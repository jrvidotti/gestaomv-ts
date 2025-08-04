'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ClipboardList,
  ArrowLeft,
  User,
  Building2,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Package,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { api } from '@/lib/trpc';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { MateriaisVisualizacao } from '@/components/almoxarifado/materiais-visualizacao';
import { STATUS_SOLICITACAO } from '@/shared';

const StatusBadgeMap = {
  PENDENTE: { variant: 'default' as const, label: 'Pendente', color: 'bg-blue-100 text-blue-800' },
  APROVADA: { variant: 'secondary' as const, label: 'Aprovada', color: 'bg-green-100 text-green-800' },
  REJEITADA: { variant: 'destructive' as const, label: 'Rejeitada', color: 'bg-red-100 text-red-800' },
  CANCELADA: { variant: 'outline' as const, label: 'Cancelada', color: 'bg-orange-100 text-orange-800' },
  ATENDIDA: { variant: 'outline' as const, label: 'Atendida', color: 'bg-gray-100 text-gray-800' },
};

interface SolicitacaoPageProps {
  params: Promise<{ id: string }>;
}

export default function SolicitacaoPage({ params }: SolicitacaoPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const solicitacaoId = parseInt(resolvedParams.id, 10);

  const {
    data: solicitacao,
    isLoading,
    error,
    refetch,
  } = api.almoxarifado.buscarSolicitacao.useQuery({
    id: solicitacaoId,
  });

  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.roles?.includes(USER_ROLES.ADMIN);
  const isAprovador = currentUser?.roles?.includes(USER_ROLES.APROVADOR_ALMOXARIFADO);
  const isGerente = currentUser?.roles?.includes(USER_ROLES.GERENCIA_ALMOXARIFADO);
  const isOwner = currentUser?.id === solicitacao?.solicitanteId;

  // Permissões derivadas
  const podeAprovarRejeitar = isAdmin || isAprovador;
  const podeAtender = isAdmin || isAprovador || isGerente;

  const aprovarSolicitacao = api.almoxarifado.aprovarOuRejeitarSolicitacao.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const cancelarSolicitacao = api.almoxarifado.cancelarSolicitacao.useMutation({
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
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleAprovar = async () => {
    if (confirm('Deseja aprovar esta solicitação?')) {
      try {
        await aprovarSolicitacao.mutateAsync({
          id: solicitacaoId,
          data: { status: STATUS_SOLICITACAO.APROVADA },
        });
      } catch (error) {
        console.error('Erro ao aprovar solicitação:', error);
      }
    }
  };

  const handleRejeitar = async () => {
    const motivo = prompt('Informe o motivo da rejeição (obrigatório):');
    if (motivo && motivo.trim()) {
      try {
        await aprovarSolicitacao.mutateAsync({
          id: solicitacaoId,
          data: {
            status: STATUS_SOLICITACAO.REJEITADA,
            motivoRejeicao: motivo.trim(),
          },
        });
      } catch (error) {
        console.error('Erro ao rejeitar solicitação:', error);
      }
    } else if (motivo !== null) {
      alert('O motivo da rejeição é obrigatório.');
    }
  };

  const handleAtender = async () => {
    if (
      confirm(
        'Confirma que os materiais foram separados e as quantidades estão corretas?\n\nEsta ação marcará a solicitação como ATENDIDA.',
      )
    ) {
      try {
        if (!solicitacao || !solicitacao.itens) {
          throw new Error('Solicitação não encontrada ou sem itens');
        }

        const itensAtendimento = solicitacao.itens.map((item) => ({
          id: item.id,
          qtdAtendida: item.qtdSolicitada,
        }));

        await atenderSolicitacao.mutateAsync({
          id: solicitacaoId,
          data: {
            itens: itensAtendimento,
          },
        });
      } catch (error) {
        console.error('Erro ao atender solicitação:', error);
      }
    }
  };

  const handleCancelar = async () => {
    if (confirm('Deseja cancelar esta solicitação?')) {
      try {
        await cancelarSolicitacao.mutateAsync({
          id: solicitacaoId,
        });
      } catch (error) {
        console.error('Erro ao cancelar solicitação:', error);
      }
    }
  };

  const header = (
    <PageHeader
      title={`Solicitação #${solicitacaoId.toString().padStart(6, '0')}`}
      subtitle="Detalhes da solicitação de material"
      actions={[
        <Link key="voltar" href="/admin/almoxarifado/solicitacoes">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>,
        ...(podeAprovarRejeitar && solicitacao?.status === STATUS_SOLICITACAO.PENDENTE
          ? [
              <Button
                key="aprovar"
                onClick={handleAprovar}
                disabled={aprovarSolicitacao.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar
              </Button>,
              <Button
                key="rejeitar"
                variant="destructive"
                onClick={handleRejeitar}
                disabled={aprovarSolicitacao.isPending}
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
                disabled={atenderSolicitacao.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Package className="h-4 w-4 mr-2" />
                {atenderSolicitacao.isPending ? 'Atendendo...' : 'Atender'}
              </Button>,
            ]
          : []),
        ...(isOwner && solicitacao?.status === STATUS_SOLICITACAO.PENDENTE
          ? [
              <Button
                key="cancelar"
                variant="outline"
                onClick={handleCancelar}
                disabled={cancelarSolicitacao.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {cancelarSolicitacao.isPending ? 'Cancelando...' : 'Cancelar'}
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
            <div className="text-muted-foreground">Carregando solicitação...</div>
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
                <h3 className="text-lg font-semibold mb-2">Solicitação não encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  A solicitação que você está procurando não existe ou foi removida.
                </p>
                <Link href="/admin/almoxarifado/solicitacoes">
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
  const materiaisVisualizacao =
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
        nome: material?.nome || 'Material não encontrado',
        foto: material?.foto || null,
        tipoMaterial: material?.tipoMaterial ? { nome: material.tipoMaterial.nome } : null,
        unidadeMedida: material?.unidadeMedida ? { nome: material.unidadeMedida.nome } : null,
        valorUnitario: material?.valorUnitario || 0,
        qtdSolicitada: item.qtdSolicitada,
        qtdAtendida: item.qtdAtendida,
      };
    }) || [];

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_ALMOXARIFADO, USER_ROLES.USUARIO_ALMOXARIFADO]}>
      <AdminLayout header={header}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Informações Principais */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Status e Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Status da Solicitação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status Atual:</span>
                  <Badge variant={StatusBadgeMap[solicitacao.status].variant} className="text-sm">
                    {StatusBadgeMap[solicitacao.status].label}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Data da Solicitação</p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(solicitacao.dataOperacao)}</p>
                    </div>
                  </div>

                  {solicitacao.dataAprovacao && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Data de Aprovação</p>
                        <p className="text-sm text-muted-foreground">{formatDateTime(solicitacao.dataAprovacao)}</p>
                      </div>
                    </div>
                  )}

                  {solicitacao.dataAtendimento && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Data de Atendimento</p>
                        <p className="text-sm text-muted-foreground">{formatDateTime(solicitacao.dataAtendimento)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Solicitante e Unidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Solicitante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Solicitante</p>
                      <p className="text-sm text-muted-foreground">{solicitacao.solicitante?.name}</p>
                      <p className="text-xs text-muted-foreground">{solicitacao.solicitante?.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Unidade de Destino</p>
                      <p className="text-sm text-muted-foreground">{solicitacao.unidade?.nome || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{solicitacao.observacoes}</p>
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
