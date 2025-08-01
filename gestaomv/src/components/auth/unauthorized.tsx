import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from '@tanstack/react-router';
import { usePermissions } from '@/hooks/use-permissions';

interface UnauthorizedProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function Unauthorized({
  title = 'Acesso Negado',
  description = 'Você não tem permissão para acessar esta página.',
  showBackButton = true,
  showHomeButton = true,
}: UnauthorizedProps) {
  const router = useRouter();
  const { getAccessibleModules } = usePermissions();

  const handleBackClick = () => {
    router.history.back();
  };

  const handleHomeClick = () => {
    // Tentar redirecionar para um módulo que o usuário tem acesso
    const accessibleModules = getAccessibleModules();

    if (accessibleModules.length > 0) {
      // Usar o primeiro módulo acessível
      const targetModule = accessibleModules[0];
      router.navigate({ to: targetModule.url });
    } else {
      // Se não tem acesso a nenhum módulo, ir para /admin
      router.navigate({ to: '/admin' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Entre em contato com o administrador do sistema se você acredita que deveria ter acesso a esta
            funcionalidade.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            {showBackButton && (
              <Button variant="outline" onClick={handleBackClick} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}

            {showHomeButton && (
              <Button onClick={handleHomeClick} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Ir para Início
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
