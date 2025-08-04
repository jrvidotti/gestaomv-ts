import { createFileRoute, Link } from '@tanstack/react-router'
import { useTRPC } from '@/integrations/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Mail, Calendar, Activity, Key } from 'lucide-react'
import { USER_ROLES_DATA } from '@/constants/user-roles'

export const Route = createFileRoute('/admin/user/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const trpc = useTRPC()
  
  const { data: user, isLoading, error } = useQuery(
    trpc.auth.profile.queryOptions()
  )

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-red-500">Erro ao carregar perfil: {error.message}</div>
                {error.message.includes('Token de autenticação necessário') && (
                  <div className="text-muted-foreground">
                    <p>Você precisa fazer login novamente.</p>
                    <Link to="/login" className="text-blue-500 hover:underline">
                      Ir para login
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                Nenhum dados de usuário encontrados
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie as informações do seu perfil
            </p>
          </div>
          {user?.authProvider !== 'tagone' && (
            <Button asChild variant="secondary">
              <Link to="/admin/user/alterar-senha" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Alterar Senha
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>Seus dados pessoais e de identificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar ?? undefined} alt={`${user.name}`} />
                  <AvatarFallback className="text-lg">{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user.isActive ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Inativo
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
              <CardDescription>Datas importantes e status da conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Data de Criação</h4>
                  <p className="text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Última Atualização</h4>
                  <p className="text-sm">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status da Conta</h4>
                  <p className="text-sm">
                    {user.isActive ? (
                      <span className="text-green-600">Conta ativa e funcional</span>
                    ) : (
                      <span className="text-red-600">Conta desativada</span>
                    )}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Funções e Permissões</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {user.roles.map((role) => {
                      const roleData = USER_ROLES_DATA[role]
                      return (
                        <Badge key={role} variant={roleData?.color || 'default'}>
                          {roleData?.label || role}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}