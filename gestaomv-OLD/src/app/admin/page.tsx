'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { getLastAccessedModule } from '@/lib/last-accessed-module';
import { Loader2, Building2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminRedirectPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { getDefaultAccessibleModule, canAccessModule } = usePermissions();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const performRedirect = async () => {
      setRedirecting(true);
      setError(null);

      try {
        // 1. Tentar usar o último módulo acessado
        const lastModule = getLastAccessedModule();
        if (lastModule && canAccessModule(lastModule)) {
          router.push(`/admin/${lastModule}`);
          return;
        }

        // 2. Usar o primeiro módulo com acesso
        const defaultModule = getDefaultAccessibleModule();
        if (defaultModule) {
          router.push(defaultModule.url);
          return;
        }

        // 3. Se não tem acesso a nenhum módulo
        setError('Você não tem acesso a nenhum módulo do sistema. Entre em contato com o administrador.');
      } catch (err) {
        console.error('Erro ao redirecionar:', err);
        setError('Ocorreu um erro ao carregar o sistema. Tente novamente.');
      } finally {
        setRedirecting(false);
      }
    };

    performRedirect();
  }, [user, authLoading, router, canAccessModule, getDefaultAccessibleModule]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="relative mb-6">
              <Building2 className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">Carregando</h2>
            <p className="text-muted-foreground text-center text-sm mb-4">Verificando credenciais...</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aguarde um momento
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="relative mb-6">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2 text-red-600">Erro de Acesso</h2>
            <p className="text-muted-foreground text-center text-sm mb-4">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/login')}>
                Fazer Login
              </Button>
              <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <div className="relative mb-6">
            <Building2 className="h-16 w-16 text-muted-foreground" />
          </div>

          <h2 className="text-xl font-semibold text-center mb-2">Carregando Sistema</h2>

          <p className="text-muted-foreground text-center text-sm mb-4">
            {redirecting ? 'Redirecionando para seu módulo...' : 'Preparando acesso...'}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Aguarde um momento
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
