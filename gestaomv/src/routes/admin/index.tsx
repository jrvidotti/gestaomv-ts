import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'

export const Route = createFileRoute('/admin/')({
  component: AdminRedirect,
})

function AdminRedirect() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { getAccessibleModules } = usePermissions()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.navigate({ to: '/login' })
      return
    }

    // Obter módulos acessíveis para o usuário
    const accessibleModules = getAccessibleModules()

    if (accessibleModules.length > 0) {
      // Redirecionar para o primeiro módulo acessível
      const targetModule = accessibleModules[0]
      router.navigate({ to: targetModule.url })
    } else {
      // Se não tem acesso a nenhum módulo, redirecionar para login
      router.navigate({ to: '/login' })
    }
  }, [isAuthenticated, isLoading, router, getAccessibleModules])

  // Mostrar loading enquanto determina para onde redirecionar
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  // Mostrar loading durante redirecionamento
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  )
}