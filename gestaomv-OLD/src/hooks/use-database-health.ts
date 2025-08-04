import { useState, useEffect, useCallback } from 'react';
import { HealthCheckDTO, HealthStatus } from '@/shared/schemas/dto/superadmin';

interface UseDatabaseHealthOptions {
  /** Intervalo de verificação em milissegundos (padrão: 30 segundos) */
  checkInterval?: number;
  /** Se deve verificar automaticamente na inicialização (padrão: true) */
  autoCheck?: boolean;
  /** Se deve fazer verificações periódicas (padrão: true) */
  enablePolling?: boolean;
}

interface UseDatabaseHealthReturn {
  /** Status atual do health check */
  healthData: HealthCheckDTO | null;
  /** Se está carregando */
  isLoading: boolean;
  /** Erro se houver */
  error: string | null;
  /** Se há problemas detectados */
  hasIssues: boolean;
  /** Função para forçar uma verificação manual */
  refetch: () => Promise<void>;
}

export function useDatabaseHealth(options: UseDatabaseHealthOptions = {}): UseDatabaseHealthReturn {
  const {
    checkInterval = 30000, // 30 segundos
    autoCheck = true,
    enablePolling = true,
  } = options;

  const [healthData, setHealthData] = useState<HealthCheckDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: HealthCheckDTO = await response.json();
      setHealthData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao verificar saúde do sistema';
      setError(errorMessage);
      console.error('Erro no health check:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificação inicial
  useEffect(() => {
    if (autoCheck) {
      checkHealth();
    }
  }, [autoCheck, checkHealth]);

  // Polling periódico
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(checkHealth, checkInterval);
    return () => clearInterval(interval);
  }, [enablePolling, checkInterval, checkHealth]);

  // Calcular se há problemas
  const hasIssues = healthData?.status !== 'ok';

  return {
    healthData,
    isLoading,
    error,
    hasIssues,
    refetch: checkHealth,
  };
}
