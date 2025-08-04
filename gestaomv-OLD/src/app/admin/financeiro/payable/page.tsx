'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardStats } from '@/components/card-stats';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus, TrendingDown, Calendar, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

export default function PayablePage() {
  const header = (
    <PageHeader
      title="Contas a Pagar"
      subtitle="Gerencie todas as contas e obrigações financeiras"
      actions={[
        <Button key="nova-conta">
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
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
            <CardStats
              titulo="Total a Pagar"
              valor="R$ 45.231,50"
              icone={DollarSign}
              corValor="text-2xl font-bold text-red-600"
            />

            <CardStats
              titulo="Vencendo Hoje"
              valor="R$ 2.450,00"
              icone={Calendar}
              corValor="text-2xl font-bold text-yellow-600"
            />

            <CardStats
              titulo="Em Atraso"
              valor="R$ 1.200,00"
              icone={AlertCircle}
              corIcone="text-red-500"
              corValor="text-2xl font-bold text-red-600"
            />

            <CardStats
              titulo="Pago este Mês"
              valor="R$ 12.800,00"
              icone={TrendingDown}
              corValor="text-2xl font-bold text-green-600"
            />
          </div>

          {/* Module Under Development */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Módulo em Desenvolvimento</h3>
              <p className="text-muted-foreground text-center max-w-md">
                O módulo de Contas a Pagar está sendo desenvolvido e estará disponível em breve. Aqui você poderá
                gerenciar todas as suas obrigações financeiras.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
