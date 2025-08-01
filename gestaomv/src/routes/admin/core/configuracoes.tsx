import { createFileRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { RouteGuard } from '@/components/auth/route-guard'
import { USER_ROLES } from '@/modules/core/enums'
import { Settings, Save, Users, Bell, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useTRPC } from '@/integrations/trpc/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/core/configuracoes')({
  component: ConfiguracoesPage,
})

function ConfiguracoesPage() {
  const trpc = useTRPC()

  // Estados locais para as configurações
  const [allowRegistration, setAllowRegistration] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [notifyNewUsers, setNotifyNewUsers] = useState(false)
  const [notifyApprovedUsers, setNotifyApprovedUsers] = useState(false)
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])

  // Queries tRPC
  const { data: configuracoes, isLoading: configLoading } = useQuery(
    trpc.configuracoes.getConfiguracoesSistema.queryOptions()
  )
  const { data: users, isLoading: usersLoading } = useQuery(
    trpc.users.findAll.queryOptions()
  )

  // Mutation para salvar configurações
  const { mutate: saveConfiguracoes, isPending: isSaving } = useMutation({
    ...trpc.configuracoes.updateConfiguracoesSistema.mutationOptions(),
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao salvar configurações: ${error.message}`)
    }
  })

  // Filtrar apenas administradores
  const adminUsers = users?.filter(user => 
    user.roles.includes(USER_ROLES.ADMIN)
  ) || []

  // Sincronizar configurações com estado local quando carregadas
  useEffect(() => {
    if (configuracoes) {
      setAllowRegistration(configuracoes.allowRegistration || false)
      setEmailNotifications(configuracoes.emailNotifications || false)
      setMaintenanceMode(configuracoes.maintenanceMode || false)
      setNotifyNewUsers(configuracoes.notifyNewUsers || false)
      setNotifyApprovedUsers(configuracoes.notifyApprovedUsers || false)
      
      // Parsear IDs de administradores (string → array)
      const adminIds = configuracoes.notifyAdminIds 
        ? configuracoes.notifyAdminIds.split(',').filter(Boolean)
        : []
      setSelectedAdmins(adminIds)
    }
  }, [configuracoes])

  const handleSaveAll = () => {
    // Converter array de IDs para string
    const adminIdsString = selectedAdmins.join(',')
    
    saveConfiguracoes({
      allowRegistration,
      emailNotifications,
      maintenanceMode,
      notifyNewUsers,
      notifyApprovedUsers,
      notifyAdminIds: adminIdsString
    })
  }

  const toggleAdminSelection = (adminId: string) => {
    setSelectedAdmins(prev => 
      prev.includes(adminId)
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    )
  }

  const header = (
    <PageHeader
      title="Configurações"
      subtitle="Gerenciar configurações globais do sistema"
      icon={<Settings className="h-5 w-5" />}
      actions={[
        <Button key="save" onClick={handleSaveAll} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Todas'}
        </Button>
      ]}
    />
  )

  if (configLoading || usersLoading) {
    return (
      <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
        <AdminLayout header={header}>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </AdminLayout>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          {/* Card 1 - Configurações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-registration" className="text-base">
                    Permitir registro de novos usuários
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Permite que novos usuários se registrem no sistema
                  </div>
                </div>
                <Switch
                  id="allow-registration"
                  checked={allowRegistration}
                  onCheckedChange={setAllowRegistration}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">
                    Notificações por email
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Habilita o envio de notificações por email
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode" className="text-base">
                    Modo de manutenção
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Bloqueia acesso ao sistema para manutenção
                  </div>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Notificações de Novos Usuários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Notificações de Novos Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-new-users" className="text-base">
                    Notificar criação de usuários
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Send email notifications when new users are created
                  </div>
                </div>
                <Switch
                  id="notify-new-users"
                  checked={notifyNewUsers}
                  onCheckedChange={setNotifyNewUsers}
                />
              </div>

              {notifyNewUsers && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Administradores que recebem notificações:
                  </Label>
                  
                  {adminUsers.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Nenhum administrador encontrado
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {adminUsers.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-sm text-muted-foreground">{admin.email}</div>
                          </div>
                          <Switch
                            checked={selectedAdmins.includes(admin.id)}
                            onCheckedChange={() => toggleAdminSelection(admin.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedAdmins.length === 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Nenhum administrador selecionado. As notificações não serão enviadas.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3 - Notificações de Aprovação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações de Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-approved-users" className="text-base">
                    Notificar usuários aprovados
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Envia email de boas-vindas quando usuários são aprovados
                  </div>
                </div>
                <Switch
                  id="notify-approved-users"
                  checked={notifyApprovedUsers}
                  onCheckedChange={setNotifyApprovedUsers}
                />
              </div>

              {notifyApprovedUsers && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <Bell className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Quando ativo, os usuários receberão um email de boas-vindas automaticamente 
                    após serem aprovados pelos administradores.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RouteGuard>
  )
}