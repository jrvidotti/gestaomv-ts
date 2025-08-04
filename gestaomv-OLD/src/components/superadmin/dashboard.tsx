'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SystemStatsDTO,
  SystemInfoDTO,
  MigrationInfoDTO,
  MigrationStatusDTO,
  SeedOperationResponseDTO,
  ErrorResponseDTO,
} from '@/shared/schemas/dto/superadmin';

export default function SuperadminDashboard() {
  const [stats, setStats] = useState<SystemStatsDTO | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfoDTO | null>(null);
  const [migrationInfo, setMigrationInfo] = useState<MigrationInfoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [showOnlyLog, setShowOnlyLog] = useState(false);

  const addLog = useCallback((message: string, timestamp?: string) => {
    const timestamp2 = timestamp || new Date().toLocaleTimeString();
    setOperationLog((prev) => [...prev, `[${timestamp2}] ${message}`]);
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const [statsRes, systemRes, migrationsRes] = await Promise.all([
        fetch('/api/superadmin/stats'),
        fetch('/api/superadmin/system'),
        fetch('/api/superadmin/migrations'),
      ]);

      const statsData = await statsRes.json();
      if (statsRes.status === 500) {
        addLog('⚠️ Tabelas do banco não encontradas - Execute as migrações');
        setStats({
          base: { users: 0, empresas: 0, unidades: 0 },
          rh: { funcionarios: 0, departamentos: 0, equipes: 0, cargos: 0 },
          almoxarifado: { materiais: 0, solicitacoes: 0 },
        });
      } else {
        setStats(statsData);
      }

      setSystemInfo(await systemRes.json());
      setMigrationInfo(await migrationsRes.json());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      addLog('❌ Erro ao carregar dados iniciais');
    } finally {
      setLoading(false);
    }
  }, [addLog]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const runMigrations = async () => {
    setShowOnlyLog(true);
    addLog('🔄 Iniciando aplicação de migrações...');
    try {
      const response = await fetch('/api/superadmin/migrations', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        addLog('✅ Migrações aplicadas com sucesso!');
        // Recarregar dados após aplicar migrações
        setTimeout(() => {
          loadInitialData();
        }, 1000);
      } else {
        addLog(`❌ Erro ao aplicar migrações: ${result.error}`);
      }
    } catch (error) {
      addLog('❌ Erro ao executar migrações');
    }
  };

  const runSeedOperation = async (operation: 'import' | 'export') => {
    setShowOnlyLog(true);
    addLog(`🔄 Iniciando operação de seed: ${operation}...`);
    try {
      const response = await fetch('/api/superadmin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation }),
      });
      const result = await response.json();
      console.log(result);

      if (result.success) {
        if (operation === 'import') {
          loadInitialData(); // Recarregar estatísticas após import
        }
        (result as SeedOperationResponseDTO).outputs.forEach((output) => addLog(output.message, output.timestamp));
      } else {
        addLog(`❌ Erro na operação ${operation}: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Erro ao executar operação ${operation}`);
    }
  };

  const createNewAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = (formData.get('name') as string) || 'Administrador';

    setShowOnlyLog(true);
    addLog(`👑 Criando novo administrador: ${email}...`);
    try {
      const response = await fetch('/api/superadmin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const result = await response.json();

      if (result.success) {
        addLog(`✅ Administrador criado com sucesso: ${email}`);
        // Limpar formulário
        (event.target as HTMLFormElement).reset();
        // Recarregar estatísticas
        loadInitialData();
      } else {
        const errorDetails = result.details;
        if (Array.isArray(errorDetails)) {
          errorDetails.forEach((err) => addLog(`❌ ${err.field}: ${err.message}`));
        } else {
          addLog(`❌ Erro ao criar administrador: ${errorDetails}`);
        }
      }
    } catch (error) {
      addLog('❌ Erro ao criar administrador');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🛠️ Superadmin Dashboard</h1>
        <Badge variant="secondary">Ambiente: {systemInfo?.application.environment}</Badge>
      </div>

      {!showOnlyLog && (
        <>
          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>🖥️ Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Aplicação</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Nome:</strong> {systemInfo?.application.name}
                    </p>
                    <p>
                      <strong>Versão:</strong> {systemInfo?.application.version}
                    </p>
                    <p>
                      <strong>Node.js:</strong> {systemInfo?.application.nodeVersion}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Banco de Dados</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Arquivo:</strong> {systemInfo?.database.path}
                    </p>
                    <p>
                      <strong>Tamanho:</strong> {systemInfo?.database.size}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <Badge variant={systemInfo?.database.exists ? 'default' : 'destructive'} className="ml-2">
                        {systemInfo?.database.exists ? 'Conectado' : 'Erro'}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Servidor</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Porta:</strong> {systemInfo?.server.port}
                    </p>
                    <p>
                      <strong>Uptime:</strong> {systemInfo?.server.uptime}
                    </p>
                    <p>
                      <strong>Memória (RSS):</strong> {systemInfo?.server.memoryUsage.rss}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔄 Migrações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  <p>
                    Total:
                    <Badge variant="outline" className="mx-1">
                      {migrationInfo?.summary?.total || 0}
                    </Badge>{' '}
                    | Aplicadas:{' '}
                    <Badge variant="default" className="mx-1">
                      {migrationInfo?.summary?.applied || 0}
                    </Badge>{' '}
                    | Pendentes: <Badge variant="secondary">{migrationInfo?.summary?.pending || 0}</Badge>
                  </p>
                  <p>
                    Pasta: <code className="text-xs">{migrationInfo?.migrationsFolder}</code>
                  </p>
                </div>
                <Button onClick={runMigrations} variant="secondary">
                  Aplicar Migrações Pendentes ({migrationInfo?.summary?.pending || 0})
                </Button>
              </div>

              {/* Lista detalhada de migrações pendentes */}
              {migrationInfo?.migrationsStatus &&
                migrationInfo.migrationsStatus.filter((m) => m.status === 'pending').length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <h4 className="text-sm font-semibold">Migrações Pendentes:</h4>
                    {migrationInfo.migrationsStatus
                      .filter((migration: MigrationStatusDTO) => migration.status === 'pending')
                      .map((migration: MigrationStatusDTO) => (
                        <div
                          key={migration.idx}
                          className="flex items-center justify-between text-xs p-2 bg-muted rounded"
                        >
                          <div className="flex flex-col">
                            <span className="font-mono">{migration.tag}</span>
                            <span className="text-muted-foreground text-xs">#{migration.idx}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs w-24">
                            ⏳ Pendente
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Estatísticas do Banco */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Módulo Base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Usuários:</span>
                  <Badge>{stats?.base.users}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Empresas:</span>
                  <Badge>{stats?.base.empresas}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Unidades:</span>
                  <Badge>{stats?.base.unidades}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>👥 Módulo RH</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Funcionários:</span>
                  <Badge>{stats?.rh.funcionarios}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Departamentos:</span>
                  <Badge>{stats?.rh.departamentos}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Equipes:</span>
                  <Badge>{stats?.rh.equipes}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cargos:</span>
                  <Badge>{stats?.rh.cargos}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📦 Almoxarifado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Materiais:</span>
                  <Badge>{stats?.almoxarifado.materiais}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Solicitações:</span>
                  <Badge>{stats?.almoxarifado.solicitacoes}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Operações Administrativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🌱 Operações de Seed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Gerenciar dados de seed do sistema</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => runSeedOperation('export')} variant="outline" className="flex-1">
                    Exportar Dados
                  </Button>
                  <Button onClick={() => runSeedOperation('import')} variant="outline" className="flex-1">
                    Importar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>👑 Gerenciar Administradores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Criar novos usuários administradores do sistema</p>
                </div>

                <form onSubmit={createNewAdmin} className="space-y-3">
                  <div>
                    <label htmlFor="admin-email" className="text-sm font-medium">
                      Email *
                    </label>
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      required
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                      placeholder="admin@empresa.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-password" className="text-sm font-medium">
                      Senha *
                    </label>
                    <input
                      id="admin-password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-name" className="text-sm font-medium">
                      Nome
                    </label>
                    <input
                      id="admin-name"
                      name="name"
                      type="text"
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                      placeholder="Administrador"
                    />
                  </div>

                  <Button type="submit" className="w-full" variant="outline">
                    Criar Administrador
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Log de Operações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📝 Log de Operações</CardTitle>
            {showOnlyLog && (
              <Button onClick={() => setShowOnlyLog(false)} variant="outline" size="sm">
                ← Voltar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {operationLog.length > 0 ? (
            <div className="font-mono text-sm bg-muted p-4 rounded-md">
              {operationLog.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhuma operação executada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
