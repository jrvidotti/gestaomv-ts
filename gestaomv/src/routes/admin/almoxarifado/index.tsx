import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CardStats } from '@/components/card-stats'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Package,
  Plus,
  TrendingUp,
  ClipboardList,
  Boxes,
  FileText,
  Clock,
  CheckCircle,
  Building2,
  DollarSign,
  Filter,
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { USER_ROLES } from '@/modules/core/enums'
import { STATUS_SOLICITACAO } from '@/modules/almoxarifado/enums'
import { STATUS_OPTIONS } from '@/modules/almoxarifado/consts'
import { useTRPC } from '@/integrations/trpc/react'
import { useQuery } from '@tanstack/react-query'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

type PeriodoPreset = {
  label: string
  value: string
  dataInicial?: Date
  dataFinal?: Date
}

const obterPeriodosPreset = (): PeriodoPreset[] => {
  const agora = new Date()
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())

  return [
    {
      label: 'Todos os períodos',
      value: 'all',
    },
    {
      label: 'Últimos 30 dias',
      value: '30d',
      dataInicial: new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000),
      dataFinal: hoje,
    },
    {
      label: 'Mês passado',
      value: 'last_month',
      dataInicial: new Date(agora.getFullYear(), agora.getMonth() - 1, 1),
      dataFinal: new Date(agora.getFullYear(), agora.getMonth(), 0),
    },
    {
      label: 'Últimos 365 dias',
      value: '365d',
      dataInicial: new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000),
      dataFinal: hoje,
    },
    {
      label: 'Ano passado',
      value: 'last_year',
      dataInicial: new Date(agora.getFullYear() - 1, 0, 1),
      dataFinal: new Date(agora.getFullYear() - 1, 11, 31),
    },
    {
      label: 'Personalizado',
      value: 'custom',
    },
  ]
}

export const Route = createFileRoute('/admin/almoxarifado/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('all')
  const [dataInicial, setDataInicial] = useState<Date | undefined>()
  const [dataFinal, setDataFinal] = useState<Date | undefined>()
  const [statusFiltro, setStatusFiltro] = useState<string>('all')

  const trpc = useTRPC()
  const periodosPreset = obterPeriodosPreset()
  const periodoAtual = periodosPreset.find((p) => p.value === periodoSelecionado)

  // Determinar filtros baseado na seleção
  const filtros = useMemo(
    () => ({
      ...(periodoSelecionado === 'custom'
        ? { dataInicial, dataFinal }
        : periodoAtual
          ? { dataInicial: periodoAtual.dataInicial, dataFinal: periodoAtual.dataFinal }
          : {}),
      status: statusFiltro !== 'all' ? statusFiltro : undefined,
    }),
    [periodoSelecionado, periodoAtual, dataInicial, dataFinal, statusFiltro],
  )

  const { data: estatisticas, isLoading: carregandoStats } = useQuery(trpc.almoxarifado.obterEstatisticas.queryOptions(filtros))
  const { data: topMateriais, isLoading: carregandoTop } = useQuery(trpc.almoxarifado.obterTopMateriais.queryOptions({
    limite: 5,
    ...filtros,
  }))
  const { data: usoPorTipo, isLoading: carregandoTipo } = useQuery(trpc.almoxarifado.obterUsoPorTipo.queryOptions(filtros))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handlePeriodoChange = (value: string) => {
    setPeriodoSelecionado(value)
    if (value !== 'custom') {
      setDataInicial(undefined)
      setDataFinal(undefined)
    }
  }

  const obterDescricaoPeriodo = () => {
    let descricao = ''

    if (periodoSelecionado === 'custom' && (dataInicial || dataFinal)) {
      const inicio = dataInicial ? dataInicial.toLocaleDateString('pt-BR') : '...'
      const fim = dataFinal ? dataFinal.toLocaleDateString('pt-BR') : '...'
      descricao = `${inicio} - ${fim}`
    } else {
      descricao = periodoAtual?.label || 'Todos os períodos'
    }

    if (statusFiltro !== 'all') {
      const statusOption = STATUS_OPTIONS.find((s) => s.value === statusFiltro)
      descricao += ` • ${statusOption?.label || statusFiltro}`
    }

    return descricao
  }

  const stats = [
    {
      title: 'Total de Solicitações',
      value: carregandoStats ? '...' : estatisticas?.totalSolicitacoes?.toString() || '0',
      description: 'Solicitações registradas',
      icon: ClipboardList,
      trend: 'up',
    },
    {
      title: 'Materiais Ativos',
      value: carregandoStats ? '...' : estatisticas?.materiaisAtivos?.toString() || '0',
      description: 'Materiais cadastrados',
      icon: Package,
      trend: 'up',
    },
    {
      title: 'Unidades Ativas',
      value: carregandoStats ? '...' : estatisticas?.unidadesAtivas?.toString() || '0',
      description: 'Unidades solicitantes',
      icon: Building2,
      trend: 'up',
    },
    {
      title: 'Valor Total Solicitado',
      value: carregandoStats ? '...' : formatCurrency(estatisticas?.valorTotalSolicitado || 0),
      description: 'Valor dos materiais',
      icon: DollarSign,
      trend: 'up',
    },
  ]

  // Dados para gráfico de status
  const dadosStatus = estatisticas
    ? [
        { name: 'Pendente', value: estatisticas.solicitacoesPorStatus.pendente, color: '#0088FE' },
        { name: 'Aprovada', value: estatisticas.solicitacoesPorStatus.aprovada, color: '#00C49F' },
        { name: 'Rejeitada', value: estatisticas.solicitacoesPorStatus.rejeitada, color: '#FF8042' },
        { name: 'Atendida', value: estatisticas.solicitacoesPorStatus.atendida, color: '#FFBB28' },
      ].filter((item) => item.value > 0)
    : []

  // Dados para gráfico de uso por tipo
  const dadosTipo =
    usoPorTipo?.slice(0, 5).map((item, index) => ({
      name: item.tipo.replace(/_/g, ' '),
      quantidade: item.totalSolicitado,
      valor: item.valorTotal,
      color: COLORS[index % COLORS.length],
    })) || []

  const header = (
    <PageHeader
      title="Almoxarifado"
      subtitle={`Gerencie materiais, solicitações e relatórios • ${obterDescricaoPeriodo()}`}
      actions={[
        <Link key="nova-solicitacao" to="/admin/almoxarifado/solicitacoes/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Solicitação
          </Button>
        </Link>,
      ]}
    />
  )

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_ALMOXARIFADO, USER_ROLES.USUARIO_ALMOXARIFADO]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Seletor de Período */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <CardDescription>Selecione o período e status para análise dos dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <Select value={periodoSelecionado} onValueChange={handlePeriodoChange}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodosPreset.map((periodo) => (
                        <SelectItem key={periodo.value} value={periodo.value}>
                          {periodo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {periodoSelecionado === 'custom' && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                      <Input
                        type="date"
                        value={dataInicial ? dataInicial.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const novaData = e.target.value ? new Date(e.target.value) : undefined
                          setDataInicial(novaData)
                        }}
                        max={dataFinal ? dataFinal.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className="w-48"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Data Final</label>
                      <Input
                        type="date"
                        value={dataFinal ? dataFinal.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const novaData = e.target.value ? new Date(e.target.value) : undefined
                          setDataFinal(novaData)
                        }}
                        min={dataInicial ? dataInicial.toISOString().split('T')[0] : undefined}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-48"
                      />
                    </div>
                  </>
                )}

                {(periodoSelecionado !== 'all' || statusFiltro !== 'all' || dataInicial || dataFinal) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPeriodoSelecionado('all')
                      setStatusFiltro('all')
                      setDataInicial(undefined)
                      setDataFinal(undefined)
                    }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((card) => (
              <CardStats key={card.title} titulo={card.title} valor={card.value} icone={card.icon} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/admin/almoxarifado/materiais">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Materiais
                  </CardTitle>
                  <CardDescription>Gerenciar catálogo de materiais</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Acessar Materiais
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/almoxarifado/solicitacoes">
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Solicitações
                  </CardTitle>
                  <CardDescription>Acompanhar solicitações</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Ver Solicitações
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatórios
                </CardTitle>
                <CardDescription>Análises e relatórios</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full" disabled>
                  Em Breve
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Solicitações por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitações por Status</CardTitle>
                <CardDescription>Distribuição das solicitações</CardDescription>
              </CardHeader>
              <CardContent>
                {carregandoStats ? (
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
                    <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uso por Tipo de Material */}
            <Card>
              <CardHeader>
                <CardTitle>Top Tipos de Material</CardTitle>
                <CardDescription>Materiais mais solicitados por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                {carregandoTipo ? (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : dadosTipo.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosTipo}>
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            name === 'quantidade' ? `${value} unidades` : formatCurrency(value as number),
                            name === 'quantidade' ? 'Quantidade' : 'Valor Total',
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade Solicitada" />
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

          {/* Top Materiais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top 5 Materiais Mais Solicitados
              </CardTitle>
              <CardDescription>Materiais com maior demanda</CardDescription>
            </CardHeader>
            <CardContent>
              {carregandoTop ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : topMateriais && topMateriais.length > 0 ? (
                <div className="space-y-4">
                  {topMateriais.map((material, index) => (
                    <div key={material.materialId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{material.materialNome}</h4>
                          <p className="text-sm text-muted-foreground">{material.materialTipo.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{material.totalSolicitado} unidades</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(material.valorTotal)}</p>
                        <p className="text-xs text-muted-foreground">{material.numeroSolicitacoes} solicitações</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum material encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status das Solicitações Recentes */}
          {!carregandoStats && estatisticas && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Status</CardTitle>
                <CardDescription>Situação atual das solicitações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <Link to="/admin/almoxarifado/solicitacoes" search={{ status: STATUS_SOLICITACAO.PENDENTE }}>
                    <div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{estatisticas.solicitacoesPorStatus.pendente}</p>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                    </div>
                  </Link>
                  <Link to="/admin/almoxarifado/solicitacoes" search={{ status: STATUS_SOLICITACAO.APROVADA }}>
                    <div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{estatisticas.solicitacoesPorStatus.aprovada}</p>
                      <p className="text-sm text-muted-foreground">Aprovadas</p>
                    </div>
                  </Link>
                  <Link to="/admin/almoxarifado/solicitacoes" search={{ status: STATUS_SOLICITACAO.ATENDIDA }}>
                    <div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                      <Boxes className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{estatisticas.solicitacoesPorStatus.atendida}</p>
                      <p className="text-sm text-muted-foreground">Atendidas</p>
                    </div>
                  </Link>
                  <Link to="/admin/almoxarifado/solicitacoes" search={{ status: STATUS_SOLICITACAO.REJEITADA }}>
                    <div className="text-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-2xl font-bold">{estatisticas.solicitacoesPorStatus.rejeitada}</p>
                      <p className="text-sm text-muted-foreground">Rejeitadas</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </RouteGuard>
  )
}