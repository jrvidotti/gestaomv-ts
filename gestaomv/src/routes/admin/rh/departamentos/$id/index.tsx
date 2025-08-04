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

export const Route = createFileRoute('/admin/rh/departamentos/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const trpc = useTRPC()

  const { data: departamento, isLoading } = useQuery(
    trpc.rh.departamentos.buscar.queryOptions({ id: Number(id) })
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
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 border rounded-lg">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-lg font-medium">Departamento Ativo</p>
                  <p className="text-sm text-muted-foreground">Pronto para receber funcionários e equipes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Links de ação */}
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ações Relacionadas</h3>
                <p className="text-muted-foreground mb-4">
                  Gerencie funcionários e equipes relacionados a este departamento.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link to="/admin/rh/funcionarios">
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Ver Funcionários
                    </Button>
                  </Link>
                  <Link to="/admin/rh/equipes">
                    <Button variant="outline">
                      <Building2 className="h-4 w-4 mr-2" />
                      Ver Equipes
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  )
}