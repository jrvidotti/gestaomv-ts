'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardStats } from '@/components/card-stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Plus, TrendingUp, Users, Target, Mail } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';

const crmStats = [
  {
    title: 'Total de Clientes',
    value: '1,247',
    description: '+15% desde o mês passado',
    icon: Users,
    trend: 'up',
  },
  {
    title: 'Oportunidades Ativas',
    value: '23',
    description: 'R$ 145,000 em potencial',
    icon: Target,
    trend: 'neutral',
  },
  {
    title: 'Campanhas Ativas',
    value: '5',
    description: '3 campanhas em andamento',
    icon: Mail,
    trend: 'up',
  },
  {
    title: 'Taxa de Conversão',
    value: '24%',
    description: '+3% desde o mês passado',
    icon: TrendingUp,
    trend: 'up',
  },
];

export default function CRMPage() {
  const header = (
    <PageHeader
      title="CRM"
      subtitle="Gerencie clientes, oportunidades e campanhas"
      actions={[
        <Button key="novo-cliente">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
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
            {crmStats.map((card) => (
              <CardStats key={card.title} titulo={card.title} valor={card.value} icone={card.icon} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Clientes
                </CardTitle>
                <CardDescription>Gerenciar base de clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Ver Clientes
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Oportunidades
                </CardTitle>
                <CardDescription>Controlar pipeline de vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Ver Oportunidades
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Campanhas
                </CardTitle>
                <CardDescription>Gerenciar campanhas de marketing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Ver Campanhas
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Module Status */}
          <Card>
            <CardHeader>
              <CardTitle>Módulo CRM</CardTitle>
              <CardDescription>Este módulo está em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Funcionalidades em Desenvolvimento</h3>
                <p className="text-muted-foreground mb-4">
                  O módulo CRM está sendo implementado com funcionalidades completas de gestão de clientes,
                  oportunidades e campanhas de marketing.
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
