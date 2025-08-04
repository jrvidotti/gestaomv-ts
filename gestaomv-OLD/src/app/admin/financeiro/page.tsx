'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardStats } from '@/components/card-stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus, TrendingUp, TrendingDown, CreditCard, Receipt } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
const financeiroStats = [
  {
    title: 'Receita Mensal',
    value: 'R$ 45,231',
    description: '+8% desde o mês passado',
    icon: DollarSign,
    trend: 'up',
  },
  {
    title: 'Contas a Receber',
    value: 'R$ 12,340',
    description: '15 faturas pendentes',
    icon: Receipt,
    trend: 'neutral',
  },
  {
    title: 'Contas a Pagar',
    value: 'R$ 8,720',
    description: '8 contas vencendo',
    icon: CreditCard,
    trend: 'warning',
  },
  {
    title: 'Fluxo de Caixa',
    value: 'R$ 23,450',
    description: '+15% desde o mês passado',
    icon: TrendingUp,
    trend: 'up',
  },
];

export default function FinanceiroPage() {
  const header = (
    <PageHeader
      title="Financeiro"
      subtitle="Gerencie contas a pagar, receber e fluxo de caixa"
      actions={[
        <Button key="nova-transacao">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
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
            {financeiroStats.map((card) => (
              <CardStats key={card.title} titulo={card.title} valor={card.value} icone={card.icon} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Contas a Pagar
                </CardTitle>
                <CardDescription>Gerenciar pagamentos pendentes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Ver Contas a Pagar
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Contas a Receber
                </CardTitle>
                <CardDescription>Controlar recebimentos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Ver Contas a Receber
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fluxo de Caixa
                </CardTitle>
                <CardDescription>Análise financeira</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Ver Fluxo de Caixa
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Module Status */}
          <Card>
            <CardHeader>
              <CardTitle>Módulo Financeiro</CardTitle>
              <CardDescription>Este módulo está em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Funcionalidades em Desenvolvimento</h3>
                <p className="text-muted-foreground mb-4">
                  O módulo financeiro está sendo implementado com funcionalidades completas de gestão de contas a pagar,
                  receber e controle de fluxo de caixa.
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
