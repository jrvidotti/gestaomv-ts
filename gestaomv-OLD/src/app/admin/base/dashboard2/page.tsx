'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardStats } from '@/components/card-stats';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { Users, Package, DollarSign, RotateCcw, UserCheck, TrendingUp, Activity, Clock } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

const statsCards = [
  {
    title: 'Usuários Ativos',
    value: '24',
    description: '+2 desde ontem',
    icon: Users,
    trend: 'up',
  },
  {
    title: 'Produtos em Estoque',
    value: '1,234',
    description: '+12% desde o mês passado',
    icon: Package,
    trend: 'up',
  },
  {
    title: 'Receita Mensal',
    value: 'R$ 45,231',
    description: '+8% desde o mês passado',
    icon: DollarSign,
    trend: 'up',
  },
  {
    title: 'RMAs Pendentes',
    value: '12',
    description: '-3 desde ontem',
    icon: RotateCcw,
    trend: 'down',
  },
];

const recentActivities = [
  {
    title: 'Novo usuário cadastrado',
    description: 'João Silva se registrou no sistema',
    time: '2 min atrás',
    type: 'user',
  },
  {
    title: 'Produto adicionado',
    description: 'Notebook Dell Inspiron foi adicionado ao estoque',
    time: '15 min atrás',
    type: 'inventory',
  },
  {
    title: 'Pagamento recebido',
    description: 'Fatura #1234 foi paga por Maria Santos',
    time: '1 hora atrás',
    type: 'finance',
  },
  {
    title: 'RMA processado',
    description: 'RMA #5678 foi aprovado e processado',
    time: '2 horas atrás',
    type: 'rma',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const header = (
    <PageHeader
      title={`Bem-vindo, ${user?.name}!`}
      subtitle="Aqui está um resumo do que está acontecendo em sua empresa hoje"
    />
  );

  return (
    <RouteGuard>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((card) => (
              <CardStats key={card.title} titulo={card.title} valor={card.value} icone={card.icon} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Activity */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividades Recentes
                </CardTitle>
                <CardDescription>Últimas atividades do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse rapidamente as funcionalidades mais usadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Gerenciar Usuários</p>
                        <p className="text-sm text-muted-foreground">Adicionar ou editar usuários</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Adicionar Produto</p>
                        <p className="text-sm text-muted-foreground">Cadastrar novo produto</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Novo Cliente</p>
                        <p className="text-sm text-muted-foreground">Cadastrar cliente no CRM</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3 hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <RotateCcw className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Processar RMA</p>
                        <p className="text-sm text-muted-foreground">Gerenciar devoluções</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Módulos</CardTitle>
              <CardDescription>Status atual de todos os módulos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Base</span>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5" />
                    <span className="font-medium">Estoque</span>
                  </div>
                  <Badge variant="secondary">Em Desenvolvimento</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">Financeiro</span>
                  </div>
                  <Badge variant="secondary">Em Desenvolvimento</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5" />
                    <span className="font-medium">RMA</span>
                  </div>
                  <Badge variant="secondary">Em Desenvolvimento</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5" />
                    <span className="font-medium">CRM</span>
                  </div>
                  <Badge variant="secondary">Em Desenvolvimento</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
