'use client';

import { useDatabaseHealth } from '@/hooks/use-database-health';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AlertTriangle, Database, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function DatabaseHealthAlert() {
  const { healthData, isLoading, hasIssues, refetch } = useDatabaseHealth({
    checkInterval: 60000, // 1 minuto
    autoCheck: true,
    enablePolling: true,
  });

  const [isDismissed, setIsDismissed] = useState(false);

  // Não mostrar se não há problemas ou se foi dispensado
  if (!hasIssues || isDismissed) {
    return null;
  }

  const getAlertContent = () => {
    if (!healthData) return null;

    switch (healthData.status) {
      case 'database_missing':
        return {
          title: 'Banco de dados não encontrado',
          description: 'O banco de dados não existe. É necessário executar as migrações iniciais para criar o banco.',
          icon: <Database className="h-4 w-4" />,
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          descColor: 'text-red-700 dark:text-red-300',
        };

      case 'migrations_pending':
        return {
          title: 'Alterações pendentes detectadas',
          description:
            'Há alterações pendentes no banco de dados. As alterações precisam ser aplicadas para o funcionamento correto do sistema.',
          icon: <AlertTriangle className="h-4 w-4" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          descColor: 'text-yellow-700 dark:text-yellow-300',
        };

      default:
        return null;
    }
  };

  const alertContent = getAlertContent();
  if (!alertContent) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="container mx-auto p-4">
        <Card className={`border-0 rounded-none ${alertContent.bgColor} ${alertContent.borderColor} border-b`}>
          <div className="flex items-center justify-between w-full p-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className={alertContent.textColor}>{alertContent.icon}</div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${alertContent.textColor}`}>{alertContent.title}</div>
                <div className={`${alertContent.descColor} mt-1 text-sm`}>{alertContent.description}</div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className={`${alertContent.textColor} hover:bg-black/10 dark:hover:bg-white/10`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 ml-8 gap-2">
            {isLoading && <Loader2 className={`h-4 w-4 animate-spin ${alertContent.textColor}`} />}

            <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Link href="/superadmin">Acessar Painel Administrativo</Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className={`${alertContent.textColor} hover:bg-black/10 dark:hover:bg-white/10`}
            >
              Verificar Novamente
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
