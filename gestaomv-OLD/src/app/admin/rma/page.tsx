'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardStats } from '@/components/card-stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

const rmaStats = [
  {
    title: 'RMAs Pendentes',
    value: '12',
    description: '3 aguardando aprovação',
    icon: Clock,
    trend: 'neutral',
  },
  {
    title: 'RMAs Aprovados',
    value: '8',
    description: '+2 desde ontem',
    icon: CheckCircle,
    trend: 'up',
  },
  {
    title: 'RMAs Rejeitados',
    value: '3',
    description: 'Motivos diversos',
    icon: AlertCircle,
    trend: 'warning',
  },
  {
    title: 'Tempo Médio',
    value: '2.5 dias',
    description: '-0.5 dias desde o mês passado',
    icon: TrendingUp,
    trend: 'up',
  },
];

export default function RMAPage() {
  const header = (
    <PageHeader
      title="RMA"
      subtitle="Gerencie solicitações de devolução e processamento"
      actions={[
        <Button key="nova-solicitacao">
          <Plus className="h-4 w-4 mr-2" />
          Nova Solicitação
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {rmaStats.map((card) => (
              <CardStats key={card.title} titulo={card.title} valor={card.value} icone={card.icon} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Solicitações
                </CardTitle>
                <CardDescription>Gerenciar solicitações de RMA</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Ver Solicitações
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Processamento
                </CardTitle>
                <CardDescription>Processar devoluções</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Ver Processamento
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Histórico
                </CardTitle>
                <CardDescription>Histórico de RMAs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Ver Histórico
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Module Status */}
          <Card>
            <CardHeader>
              <CardTitle>Módulo RMA</CardTitle>
              <CardDescription>Este módulo está em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <RotateCcw className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Funcionalidades em Desenvolvimento</h3>
                <p className="text-muted-foreground mb-4">
                  O módulo RMA está sendo implementado com funcionalidades completas de gestão de solicitações,
                  processamento e histórico de devoluções.
                </p>
                <Badge variant="secondary">Em Desenvolvimento</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
