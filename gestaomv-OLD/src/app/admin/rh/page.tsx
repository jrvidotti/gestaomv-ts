'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardStats } from '@/components/card-stats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCog,
  Plus,
  TrendingUp,
  Users,
  Users2,
  Building2,
  Briefcase,
  Star,
  Calendar,
  BarChart3,
  Award,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { api } from '@/lib/trpc';
import { USER_ROLES } from '@/shared';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function RhPage() {
  // Queries para buscar dados do RH
  const { data: funcionariosData, isLoading: carregandoFuncionarios } = api.rh.listarFuncionarios.useQuery({});
  const { data: equipesData, isLoading: carregandoEquipes } = api.rh.listarEquipes.useQuery({});
  const { data: departamentosData, isLoading: carregandoDepartamentos } = api.rh.listarDepartamentos.useQuery({});
  const { data: cargosData, isLoading: carregandoCargos } = api.rh.listarCargos.useQuery({});

  // Extrair arrays dos dados
  const funcionarios = funcionariosData?.funcionarios || [];
  const equipes = equipesData?.equipes || [];
  const departamentos = departamentosData?.departamentos || [];
  const cargos = cargosData?.cargos || [];

  // Calcular estatísticas
  const totalFuncionarios = funcionarios.length || 0;
  const funcionariosAtivos = funcionarios.filter((f) => f.status === 'ATIVO').length || 0;
  const totalEquipes = equipes.length || 0;
  const totalDepartamentos = departamentos.length || 0;

  const stats = [
    {
      title: 'Total de Funcionários',
      value: carregandoFuncionarios ? '...' : totalFuncionarios.toString(),
      description: 'Funcionários cadastrados',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Funcionários Ativos',
      value: carregandoFuncionarios ? '...' : funcionariosAtivos.toString(),
      description: 'Funcionários em atividade',
      icon: CheckCircle,
      trend: 'up',
    },
    {
      title: 'Equipes',
      value: carregandoEquipes ? '...' : totalEquipes.toString(),
      description: 'Equipes formadas',
      icon: Users2,
      trend: 'up',
    },
    {
      title: 'Departamentos',
      value: carregandoDepartamentos ? '...' : totalDepartamentos.toString(),
      description: 'Departamentos ativos',
      icon: Building2,
      trend: 'up',
    },
  ];

  // Dados para gráfico de status dos funcionários
  const funcionariosPorStatus = funcionarios.reduce((acc: Record<string, number>, func) => {
    acc[func.status] = (acc[func.status] || 0) + 1;
    return acc;
  }, {});

  const dadosStatus = Object.entries(funcionariosPorStatus).map(([status, count], index) => ({
    name: status,
    value: count as number,
    color: COLORS[index % COLORS.length],
  }));

  // Dados para gráfico de funcionários por departamento
  const funcionariosPorDepartamento = departamentos
    .map((dept, index) => ({
      name: dept.nome,
      funcionarios: funcionarios.filter((f) => f.departamentoId === dept.id).length,
      color: COLORS[index % COLORS.length],
    }))
    .filter((item) => item.funcionarios > 0);

  const header = (
    <PageHeader
      title="Recursos Humanos"
      subtitle="Gestão de funcionários, equipes e avaliações"
      actions={[
        <Link key="novo-funcionario" href="/admin/rh/funcionarios/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        </Link>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((card) => (
              <CardStats key={card.title} titulo={card.title} valor={card.value} icone={card.icon} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Link href="/admin/rh/funcionarios">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Funcionários
                  </CardTitle>
                  <CardDescription>Gerenciar funcionários</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Acessar Funcionários
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/rh/equipes">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users2 className="h-5 w-5" />
                    Equipes
                  </CardTitle>
                  <CardDescription>Administrar equipes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Ver Equipes
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/rh/departamentos">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Departamentos
                  </CardTitle>
                  <CardDescription>Configurar departamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Gerenciar Depto.
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/rh/cargos">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Cargos
                  </CardTitle>
                  <CardDescription>Administrar cargos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Ver Cargos
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Dashboard Analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Funcionários por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Funcionários por Status</CardTitle>
                <CardDescription>Distribuição dos funcionários</CardDescription>
              </CardHeader>
              <CardContent>
                {carregandoFuncionarios ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : dadosStatus.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {dadosStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum funcionário encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Funcionários por Departamento */}
            <Card>
              <CardHeader>
                <CardTitle>Funcionários por Departamento</CardTitle>
                <CardDescription>Distribuição por área</CardDescription>
              </CardHeader>
              <CardContent>
                {carregandoDepartamentos ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : funcionariosPorDepartamento.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funcionariosPorDepartamento}>
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} funcionários`, 'Quantidade']} />
                        <Legend />
                        <Bar dataKey="funcionarios" fill="#8884d8" name="Funcionários" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel - Avaliações */}
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/admin/rh/avaliacoes-experiencia">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Avaliações de Experiência
                  </CardTitle>
                  <CardDescription>Avaliar período de experiência</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Gerenciar Avaliações
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/rh/avaliacoes-periodicas">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Avaliações Periódicas
                  </CardTitle>
                  <CardDescription>Avaliações de desempenho</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Ver Avaliações
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Resumo de Equipes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-5 w-5" />
                Resumo de Equipes
              </CardTitle>
              <CardDescription>Equipes ativas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {carregandoEquipes ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : equipes && equipes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {equipes.slice(0, 6).map((equipe) => (
                    <div key={equipe.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-full">
                          <Users2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{equipe.nome}</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma equipe encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
