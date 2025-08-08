import { RouteGuard } from "@/components/auth/route-guard";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { StatsCard, StatsCardsGrid } from "@/components/factoring/dashboard/stats-cards";
import { VolumeChart } from "@/components/factoring/dashboard/volume-chart";
import { ClientesChart } from "@/components/factoring/dashboard/clientes-chart";
import { InadimplenciaChart } from "@/components/factoring/dashboard/inadimplencia-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ALL_ROLES } from "@/constants";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  Plus,
  DollarSign,
  Activity,
} from "lucide-react";
import { useState, useMemo } from "react";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export const Route = createFileRoute("/admin/factoring/")({
  component: FactoringDashboard,
});

function FactoringDashboard() {
  const [dateRange, setDateRange] = useState({
    dataInicio: startOfMonth(subMonths(new Date(), 1)),
    dataFim: endOfMonth(new Date()),
  });

  const trpc = useTRPC();

  // Data de referência fixa para evitar loop infinito
  const dataReferencia = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Normalizar para início do dia
    return hoje;
  }, []);

  // Buscar dados do dashboard executivo
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
  } = useQuery(
    trpc.factoring.relatorios.dashboardExecutivo.queryOptions({
      dataInicio: dateRange.dataInicio,
      dataFim: dateRange.dataFim,
    }),
  );

  // Buscar posição de documentos
  const {
    data: posicaoDocumentos,
    isLoading: isPosicaoLoading,
  } = useQuery(
    trpc.factoring.relatorios.posicaoDocumentos.queryOptions({
      dataReferencia: dataReferencia,
    }),
  );

  // Buscar carteira de clientes
  const {
    data: carteiraClientes,
    isLoading: isCarteiraLoading,
  } = useQuery(
    trpc.factoring.relatorios.carteiraClientes.queryOptions(),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Dados para gráficos (mock para exemplo)
  const volumeChartData = [
    { data: "2025-01-01", volume: 50000, operacoes: 10 },
    { data: "2025-01-02", volume: 75000, operacoes: 15 },
    { data: "2025-01-03", volume: 60000, operacoes: 12 },
    { data: "2025-01-04", volume: 90000, operacoes: 18 },
    { data: "2025-01-05", volume: 80000, operacoes: 16 },
  ];

  const clientesChartData = [
    { nome: "Ativos", valor: carteiraClientes?.ativos || 0, cor: "#22c55e" },
    { nome: "Bloqueados", valor: carteiraClientes?.bloqueados || 0, cor: "#ef4444" },
  ];

  const inadimplenciaChartData = [
    {
      data: "2025-01-01",
      compensados: posicaoDocumentos?.compensados.quantidade || 0,
      devolvidos: posicaoDocumentos?.devolvidos.quantidade || 0,
      pendentes: posicaoDocumentos?.pendentes.quantidade || 0,
    },
  ];

  const header = (
    <PageHeader
      title="Factoring - Dashboard"
      subtitle="Visão geral das operações de factoring"
      icon={<Activity className="h-5 w-5" />}
      actions={[
        <Button key="new-operation" asChild>
          <Link to="/admin/factoring/operacoes/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Operação
          </Link>
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[ALL_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Filtro de Data */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1">
                  <DateRangeFilter
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    label="Período de análise"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Estatísticas */}
          <StatsCardsGrid>
            <StatsCard
              title="Volume Operado"
              value={
                isDashboardLoading
                  ? "..."
                  : formatCurrency(dashboardData?.volumeOperado || 0)
              }
              description="Total de operações no período"
              icon={<DollarSign className="h-4 w-4" />}
              trend={{
                value: 12.5,
                isPositive: true,
              }}
            />
            <StatsCard
              title="Total de Operações"
              value={
                isDashboardLoading
                  ? "..."
                  : (dashboardData?.totalOperacoes || 0).toString()
              }
              description="Quantidade de operações"
              icon={<FileText className="h-4 w-4" />}
            />
            <StatsCard
              title="Clientes Ativos"
              value={
                isDashboardLoading
                  ? "..."
                  : (dashboardData?.clientesAtivos || 0).toString()
              }
              description="Clientes que operaram no período"
              icon={<Users className="h-4 w-4" />}
            />
            <StatsCard
              title="Taxa de Inadimplência"
              value={
                isDashboardLoading
                  ? "..."
                  : `${(dashboardData?.taxaInadimplencia || 0).toFixed(2)}%`
              }
              description="Documentos devolvidos vs total"
              icon={<AlertCircle className="h-4 w-4" />}
              trend={{
                value: -2.1,
                isPositive: false,
              }}
            />
          </StatsCardsGrid>

          {/* Gráficos */}
          <div className="grid gap-6 md:grid-cols-2">
            <VolumeChart data={volumeChartData} isLoading={isDashboardLoading} />
            <ClientesChart data={clientesChartData} isLoading={isCarteiraLoading} />
          </div>

          {/* Posição de Documentos */}
          <InadimplenciaChart
            data={inadimplenciaChartData}
            isLoading={isPosicaoLoading}
          />

          {/* Cards de Posição */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documentos Pendentes</p>
                    <p className="text-2xl font-bold">
                      {isPosicaoLoading ? "..." : posicaoDocumentos?.pendentes.quantidade || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPosicaoLoading 
                        ? "..." 
                        : formatCurrency(posicaoDocumentos?.pendentes.valor || 0)
                      }
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documentos Compensados</p>
                    <p className="text-2xl font-bold">
                      {isPosicaoLoading ? "..." : posicaoDocumentos?.compensados.quantidade || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPosicaoLoading 
                        ? "..." 
                        : formatCurrency(posicaoDocumentos?.compensados.valor || 0)
                      }
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documentos Devolvidos</p>
                    <p className="text-2xl font-bold">
                      {isPosicaoLoading ? "..." : posicaoDocumentos?.devolvidos.quantidade || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPosicaoLoading 
                        ? "..." 
                        : formatCurrency(posicaoDocumentos?.devolvidos.valor || 0)
                      }
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Links Rápidos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-20 flex flex-col">
              <Link to="/admin/factoring/operacoes">
                <FileText className="h-6 w-6 mb-2" />
                <span>Operações</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col">
              <Link to="/admin/factoring/clientes">
                <Users className="h-6 w-6 mb-2" />
                <span>Clientes</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col">
              <Link to="/admin/factoring/documentos">
                <FileText className="h-6 w-6 mb-2" />
                <span>Documentos</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col">
              <Link to="/admin/factoring/relatorios">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>Relatórios</span>
              </Link>
            </Button>
          </div>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}