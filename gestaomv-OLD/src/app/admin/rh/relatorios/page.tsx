'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Users, Building2, Briefcase, Star, Calendar, TrendingUp } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { USER_ROLES } from '@/shared';

export default function RelatoriosRhPage() {
  const header = <PageHeader title="Relatórios de RH" subtitle="Análises e relatórios do módulo de Recursos Humanos" />;

  const relatorios = [
    {
      title: 'Relatório de Funcionários',
      description: 'Lista completa de funcionários com dados pessoais e profissionais',
      icon: Users,
      color: 'bg-blue-500',
      disabled: true,
    },
    {
      title: 'Relatório de Departamentos',
      description: 'Estrutura organizacional e funcionários por departamento',
      icon: Building2,
      color: 'bg-green-500',
      disabled: true,
    },
    {
      title: 'Relatório de Cargos',
      description: 'Cargos disponíveis e distribuição salarial',
      icon: Briefcase,
      color: 'bg-purple-500',
      disabled: true,
    },
    {
      title: 'Relatório de Equipes',
      description: 'Composição das equipes e seus líderes',
      icon: Users,
      color: 'bg-orange-500',
      disabled: true,
    },
    {
      title: 'Relatório de Avaliações de Experiência',
      description: 'Histórico de avaliações do período de experiência',
      icon: Star,
      color: 'bg-yellow-500',
      disabled: true,
    },
    {
      title: 'Relatório de Avaliações Periódicas',
      description: 'Análise de desempenho dos funcionários',
      icon: Calendar,
      color: 'bg-red-500',
      disabled: true,
    },
    {
      title: 'Relatório de Turnover',
      description: 'Análise de rotatividade de funcionários',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      disabled: true,
    },
    {
      title: 'Relatório Executivo',
      description: 'Resumo executivo com principais métricas de RH',
      icon: BarChart3,
      color: 'bg-pink-500',
      disabled: true,
    },
  ];

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Relatórios Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatorios.map((relatorio) => (
              <Card
                key={relatorio.title}
                className={`${relatorio.disabled ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'} transition-all`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${relatorio.color} text-white`}>
                      <relatorio.icon className="h-5 w-5" />
                    </div>
                    {relatorio.title}
                  </CardTitle>
                  <CardDescription>{relatorio.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={relatorio.disabled ? 'ghost' : 'default'}
                    className="w-full"
                    disabled={relatorio.disabled}
                  >
                    {relatorio.disabled ? (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Em Breve
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Gerar Relatório
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sobre os Relatórios
              </CardTitle>
              <CardDescription>Informações sobre os relatórios disponíveis no módulo de RH</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Status de Desenvolvimento</h4>
                  <p className="text-sm text-muted-foreground">
                    Os relatórios estão em desenvolvimento e estarão disponíveis em breve. Cada relatório fornecerá
                    análises detalhadas dos dados de RH com opções de exportação em PDF e Excel.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Recursos Planejados</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Filtros avançados por período</li>
                      <li>• Exportação em PDF/Excel</li>
                      <li>• Gráficos interativos</li>
                      <li>• Agendamento automático</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium mb-2">Tipos de Análise</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Análises descritivas</li>
                      <li>• Métricas de desempenho</li>
                      <li>• Comparativos temporais</li>
                      <li>• Indicadores de tendência</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
