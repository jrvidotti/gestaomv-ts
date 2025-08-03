import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Pencil, Users, Building2 } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTRPC } from '@/integrations/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { USER_ROLES } from '@/modules/core/enums'
import { STATUS_FUNCIONARIO_DATA } from '@/modules/rh/consts'

export const Route = createFileRoute('/admin/rh/departamentos/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const trpc = useTRPC()

  const { data: departamento, isLoading } = useQuery(
    trpc.rh.obterDepartamentoCompleto.queryOptions({ id: Number(id) })
  )

  const header = (
    <PageHeader
      title={departamento?.nome || 'Departamento'}
      subtitle="Visualizar informações do departamento"
      actions={[
        <Button key="voltar" variant="outline" onClick={() => navigate({ to: '/admin/rh/departamentos' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>,
        <Link key="editar" to="/admin/rh/departamentos/$id/edit" params={{ id }}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>,
      ]}
    />
  )

  if (isLoading) {
    return (
      <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH]}>
        <AdminLayout header={header}>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando departamento...</p>
          </div>
        </AdminLayout>
      </RouteGuard>
    )
  }

  if (!departamento) {
    return (
      <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH]}>
        <AdminLayout header={header}>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Departamento não encontrado</p>
          </div>
        </AdminLayout>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-sm">{departamento.nome}</p>
                </div>
                
                {departamento.codigo && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Código</label>
                    <p className="text-sm font-mono">{departamento.codigo}</p>
                  </div>
                )}
                
                {departamento.descricao && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                    <p className="text-sm">{departamento.descricao}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{departamento._count?.funcionarios || 0}</p>
                    <p className="text-sm text-muted-foreground">Funcionários</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{departamento._count?.equipes || 0}</p>
                    <p className="text-sm text-muted-foreground">Equipes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funcionários do Departamento */}
          {departamento.funcionarios && departamento.funcionarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Funcionários do Departamento</CardTitle>
                <CardDescription>
                  Lista de funcionários vinculados a este departamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Admissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departamento.funcionarios.map((funcionario) => (
                      <TableRow key={funcionario.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={funcionario.foto || undefined} />
                              <AvatarFallback>
                                {funcionario.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                to="/admin/rh/funcionarios/$id"
                                params={{ id: funcionario.id.toString() }}
                                className="font-medium hover:underline"
                              >
                                {funcionario.nome}
                              </Link>
                              {funcionario.email && (
                                <p className="text-sm text-muted-foreground">{funcionario.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{funcionario.cargo?.nome || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_FUNCIONARIO_DATA[funcionario.status].variant}>
                            {STATUS_FUNCIONARIO_DATA[funcionario.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {funcionario.dataAdmissao 
                            ? new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Equipes do Departamento */}
          {departamento.equipes && departamento.equipes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Equipes do Departamento</CardTitle>
                <CardDescription>
                  Lista de equipes vinculadas a este departamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipe</TableHead>
                      <TableHead>Líder</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departamento.equipes.map((equipe) => (
                      <TableRow key={equipe.id}>
                        <TableCell>
                          <Link
                            to="/admin/rh/equipes/$id"
                            params={{ id: equipe.id.toString() }}
                            className="font-medium hover:underline"
                          >
                            {equipe.nome}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {equipe.lider ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={equipe.lider.foto || undefined} />
                                <AvatarFallback className="text-xs">
                                  {equipe.lider.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{equipe.lider.nome}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sem líder</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{equipe._count?.membros || 0} membros</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {equipe.descricao || 'Sem descrição'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Estado vazio para funcionários e equipes */}
          {(!departamento.funcionarios || departamento.funcionarios.length === 0) && 
           (!departamento.equipes || departamento.equipes.length === 0) && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Departamento sem funcionários ou equipes</h3>
                  <p className="text-muted-foreground mb-4">
                    Este departamento ainda não possui funcionários ou equipes vinculadas.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link to="/admin/rh/funcionarios/novo">
                      <Button variant="outline">
                        Adicionar Funcionário
                      </Button>
                    </Link>
                    <Link to="/admin/rh/equipes/nova">
                      <Button variant="outline">
                        Criar Equipe
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </RouteGuard>
  )
}