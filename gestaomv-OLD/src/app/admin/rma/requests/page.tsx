'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardStats } from '@/components/card-stats';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

export default function RMARequestsPage() {
  const header = (
    <PageHeader
      title="Solicitações RMA"
      subtitle="Gerencie solicitações de devolução, troca e reparo"
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
          <div className="grid gap-4 md:grid-cols-4">
            <CardStats titulo="Total de RMAs" valor={156} icone={RotateCcw} />

            <CardStats
              titulo="Pendentes"
              valor={12}
              icone={Clock}
              corIcone="text-yellow-500"
              corValor="text-2xl font-bold text-yellow-600"
            />

            <CardStats
              titulo="Aprovados"
              valor={128}
              icone={CheckCircle}
              corIcone="text-green-500"
              corValor="text-2xl font-bold text-green-600"
            />

            <CardStats
              titulo="Rejeitados"
              valor={16}
              icone={XCircle}
              corIcone="text-red-500"
              corValor="text-2xl font-bold text-red-600"
            />
          </div>

          {/* Module Under Development */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RotateCcw className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-muted-foreground text-center max-w-md">
                O módulo de RMA (Return Merchandise Authorization) está sendo desenvolvido e estará disponível em breve.
                Aqui você poderá gerenciar todas as solicitações de devolução, troca e reparo de produtos.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
