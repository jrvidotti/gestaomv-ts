'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardStats } from '@/components/card-stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, Plus, TrendingUp, Users, Shield, Database, UserCheck, UserPlus } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { api } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();

  const { data: userStats, isLoading: isLoadingStats } = api.base.users.getUserStats.useQuery();
  const { data: pendingUsers = [], isLoading: isLoadingPending } = api.base.users.findPendingUsers.useQuery();
  const adminStats = [
    {
      title: 'Total de Usuários',
      value: isLoadingStats ? '-' : userStats?.totalUsers.toString() || '0',
      description: 'Usuários no sistema',
      icon: Users,
      trend: 'neutral' as const,
    },
    {
      title: 'Usuários Ativos',
      value: isLoadingStats ? '-' : userStats?.activeUsers.toString() || '0',
      description: 'Com roles atribuídas',
      icon: UserCheck,
      trend: 'up' as const,
    },
    {
      title: 'Pendentes de Aprovação',
      value: isLoadingStats ? '-' : userStats?.pendingUsers.toString() || '0',
      description: 'Aguardando roles',
      icon: UserPlus,
      trend: pendingUsers.length > 0 ? ('up' as const) : ('neutral' as const),
    },
    {
      title: 'Usuários Inativos',
      value: isLoadingStats ? '-' : userStats?.inactiveUsers.toString() || '0',
      description: 'Desabilitados',
      icon: Shield,
      trend: 'down' as const,
    },
  ];

  return (
    <RouteGuard>
      <AdminLayout
        header={
          <PageHeader
            title="Administração"
            subtitle="Gerencie usuários, configurações e sistema"
            actions={[
              <Button key="novo-usuario" onClick={() => router.push('/admin/base/users/novo')}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>,
            ]}
          />
        }
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {adminStats.map((card) => (
              <CardStats key={card.title} titulo={card.title} valor={card.value} icone={card.icon} />
            ))}
          </div>

          {/* Usuários Pendentes de Aprovação */}
          {pendingUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Usuários Pendentes de Aprovação
                </CardTitle>
                <CardDescription>
                  {pendingUsers.length} usuário{pendingUsers.length !== 1 ? 's' : ''} aguardando atribuição de roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/base/users/${user.id}/edit`}>
                            <Button size="sm">
                              <UserCheck className="h-4 w-4 mr-2" />
                              Aprovar
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              className="hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push('/admin/base/users')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciar Usuários
                </CardTitle>
                <CardDescription>Visualizar e gerenciar todos os usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Acessar Lista Completa
                </Button>
              </CardContent>
            </Card>

            <Card
              className="hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push('/admin/base/configuracoes')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações
                </CardTitle>
                <CardDescription>Configurar sistema e notificações</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Acessar Configurações
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status Resumo */}
          <Card>
            <CardHeader>
              <CardTitle>Painel de Administração</CardTitle>
              <CardDescription>Status do sistema e próximas ações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sistema de Usuários</p>
                    <p className="text-sm text-muted-foreground">
                      {isLoadingStats
                        ? 'Carregando...'
                        : `${userStats?.activeUsers || 0} usuários ativos, ${userStats?.pendingUsers || 0} pendentes`}
                    </p>
                  </div>
                  <Badge variant="default">Operacional</Badge>
                </div>

                {pendingUsers.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div>
                      <p className="font-medium text-amber-800">Ação Necessária</p>
                      <p className="text-sm text-amber-700">
                        {pendingUsers.length} usuário{pendingUsers.length !== 1 ? 's' : ''} aguardando aprovação
                      </p>
                    </div>
                    <UserPlus className="h-5 w-5 text-amber-600" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Configurações do Sistema</p>
                    <p className="text-sm text-muted-foreground">Notificações e preferências configuradas</p>
                  </div>
                  <Badge variant="outline">Configurado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
