import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClipboardCheck, Plus, Search, MoreHorizontal, Eye, FileText, UserCheck, Filter } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTRPC } from '@/integrations/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { LookupSelect } from '@/components/lookup-select'
import { USER_ROLES } from '@/modules/core/enums'
import { 
  RECOMENDACAO_EXPERIENCIA, 
  RECOMENDACAO_EXPERIENCIA_OPTIONS, 
  RECOMENDACAO_EXPERIENCIA_DATA 
} from '@/modules/rh/consts'
import type { RecomendacaoExperienciaType, FiltrosAvaliacoesExperiencia } from '@/modules/rh/types'

type AvaliacoesExperienciaSearch = {
  busca?: string
  recomendacao?: RecomendacaoExperienciaType
  departamentoId?: string
  pagina?: number
}

export const Route = createFileRoute('/admin/rh/avaliacoes-experiencia/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): AvaliacoesExperienciaSearch => ({
    busca: typeof search.busca === 'string' ? search.busca : undefined,
    recomendacao: typeof search.recomendacao === 'string' ? search.recomendacao as RecomendacaoExperienciaType : undefined,
    departamentoId: typeof search.departamentoId === 'string' ? search.departamentoId : undefined,
    pagina: typeof search.pagina === 'number' ? search.pagina : 1,
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { busca: buscaUrl, recomendacao: recomendacaoUrl, departamentoId: deptoUrl, pagina: paginaUrl } = Route.useSearch()
  
  const [busca, setBusca] = useState(buscaUrl || '')
  const [recomendacaoSelecionada, setRecomendacaoSelecionada] = useState<RecomendacaoExperienciaType | 'all'>(recomendacaoUrl || 'all')
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState<string | null>(deptoUrl || null)
  const [paginaAtual, setPaginaAtual] = useState(paginaUrl || 1)

  const trpc = useTRPC()
  const buscaDebounced = useDebounce(busca, 300)

  const filtros: FiltrosAvaliacoesExperiencia = {
    busca: buscaDebounced || undefined,
    recomendacao: recomendacaoSelecionada && recomendacaoSelecionada !== 'all' ? recomendacaoSelecionada : undefined,
    departamentoId: departamentoSelecionado && departamentoSelecionado !== 'all' ? departamentoSelecionado : undefined,
    pagina: paginaAtual,
    limite: 20,
  }

  const { data, isLoading } = useQuery(trpc.rh.listarAvaliacoesExperiencia.queryOptions(filtros))
  const { data: funcionariosPendentes, isLoading: isLoadingPendentes } = useQuery(
    trpc.rh.listarFuncionariosPendentesAvaliacaoExperiencia.queryOptions()
  )
  const { data: departamentosResponse, isLoading: isLoadingDepartamentos } = useQuery(
    trpc.rh.departamentos.listar.queryOptions({})
  )
  
  // Extrair departamentos do objeto retornado pela query
  const departamentosData = departamentosResponse?.departamentos || []

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const calcularDiasExperiencia = (dataAdmissao: string) => {
    const hoje = new Date()
    const admissao = new Date(dataAdmissao)
    const diffTime = hoje.getTime() - admissao.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const limparFiltros = () => {
    setBusca('')
    setRecomendacaoSelecionada('all')
    setDepartamentoSelecionado(null)
    setPaginaAtual(1)
    navigate({
      to: '/admin/rh/avaliacoes-experiencia',
      search: {},
    })
  }

  const totalPaginas = data ? Math.ceil(data.total / filtros.limite) : 0

  const header = (
    <PageHeader
      title="Avaliações de Experiência"
      subtitle="Gerencie avaliações de funcionários em período de experiência (45 e 90 dias)"
      actions={[
        <Link key="nova-avaliacao" to="/admin/rh/avaliacoes-experiencia/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </Link>,
      ]}
    />
  )

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Funcionários Pendentes de Avaliação */}
          {!isLoadingPendentes && funcionariosPendentes && funcionariosPendentes.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <UserCheck className="h-5 w-5" />
                  Funcionários Pendentes de Avaliação
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Funcionários que estão próximos ou já venceram o prazo para avaliação de experiência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {funcionariosPendentes.map((funcionario) => (
                    <div key={funcionario.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={funcionario.foto || undefined} />
                          <AvatarFallback>
                            {funcionario.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{funcionario.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {funcionario.cargo?.nome} • {funcionario.departamento?.nome}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {calcularDiasExperiencia(funcionario.dataAdmissao)} dias de experiência
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Admitido em {formatDate(funcionario.dataAdmissao)}
                        </p>
                      </div>
                      <Link to="/admin/rh/avaliacoes-experiencia/nova" search={{ funcionarioId: funcionario.id.toString() }}>
                        <Button size="sm">
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Avaliar
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <CardDescription>Use os filtros abaixo para encontrar avaliações específicas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label htmlFor="busca" className="text-sm font-medium mb-2 block">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="busca"
                      placeholder="Buscar por nome do funcionário..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Recomendação</label>
                  <Select
                    value={recomendacaoSelecionada}
                    onValueChange={(value) => setRecomendacaoSelecionada(value as RecomendacaoExperienciaType | 'all')}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Todas as recomendações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as recomendações</SelectItem>
                      {RECOMENDACAO_EXPERIENCIA_OPTIONS.map((recomendacao) => (
                        <SelectItem key={recomendacao.value} value={recomendacao.value}>
                          {recomendacao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Departamento</label>
                  <LookupSelect
                    className="w-64"
                    value={departamentoSelecionado ?? 'all'}
                    onValueChange={(val) => setDepartamentoSelecionado(val && val !== 'all' ? val : null)}
                    options={
                      departamentosData?.map((e) => ({
                        value: e.id.toString(),
                        label: e.nome,
                      })) ?? []
                    }
                    placeholder="Selecione um departamento"
                    emptyMessage={isLoadingDepartamentos ? 'Carregando...' : 'Nenhum departamento encontrado'}
                    disabled={isLoading || isLoadingDepartamentos}
                  />
                </div>
                <Button variant="outline" onClick={limparFiltros}>
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Avaliações */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliações Realizadas</CardTitle>
              <CardDescription>
                {isLoading ? 'Carregando...' : `${data?.total || 0} avaliações encontradas`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Carregando avaliações...</p>
                </div>
              ) : !data?.avaliacoes.length ? (
                <div className="text-center py-8">
                  <ClipboardCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {busca || recomendacaoSelecionada !== 'all' || departamentoSelecionado
                      ? 'Tente ajustar os filtros para encontrar avaliações.'
                      : 'Comece realizando a primeira avaliação de experiência.'}
                  </p>
                  {!busca && recomendacaoSelecionada === 'all' && !departamentoSelecionado && (
                    <Link to="/admin/rh/avaliacoes-experiencia/nova">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Realizar Primeira Avaliação
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Período Avaliado</TableHead>
                        <TableHead>Data da Avaliação</TableHead>
                        <TableHead>Avaliador</TableHead>
                        <TableHead>Recomendação</TableHead>
                        <TableHead>Nota Final</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.avaliacoes.map((avaliacao) => (
                        <TableRow key={avaliacao.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={avaliacao.funcionario.foto || undefined} />
                                <AvatarFallback>
                                  {avaliacao.funcionario.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{avaliacao.funcionario.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {avaliacao.funcionario.cargo?.nome}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{avaliacao.periodo} dias</p>
                              <p className="text-muted-foreground">
                                {formatDate(avaliacao.dataInicio)} - {formatDate(avaliacao.dataFim)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(avaliacao.dataAvaliacao)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{avaliacao.avaliador.name}</p>
                              <p className="text-muted-foreground">{avaliacao.avaliador.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={RECOMENDACAO_EXPERIENCIA_DATA[avaliacao.recomendacao].variant}>
                              {RECOMENDACAO_EXPERIENCIA_DATA[avaliacao.recomendacao].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="text-lg font-bold">{avaliacao.notaFinal.toFixed(1)}</p>
                              <p className="text-xs text-muted-foreground">de 5.0</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link to="/admin/rh/avaliacoes-experiencia/$id" params={{ id: avaliacao.id.toString() }}>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizar
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Relatório PDF
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Paginação */}
                  {totalPaginas > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        Página {paginaAtual} de {totalPaginas}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const novaPagina = Math.max(1, paginaAtual - 1)
                            setPaginaAtual(novaPagina)
                            navigate({
                              to: '/admin/rh/avaliacoes-experiencia',
                              search: { ...Route.useSearch(), pagina: novaPagina },
                            })
                          }}
                          disabled={paginaAtual === 1}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const novaPagina = Math.min(totalPaginas, paginaAtual + 1)
                            setPaginaAtual(novaPagina)
                            navigate({
                              to: '/admin/rh/avaliacoes-experiencia',
                              search: { ...Route.useSearch(), pagina: novaPagina },
                            })
                          }}
                          disabled={paginaAtual === totalPaginas}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  )
}