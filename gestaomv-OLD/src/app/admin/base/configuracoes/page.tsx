'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Save, Shield, Users, Bell } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { USER_ROLES } from '@/shared';
import { api } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ConfiguracaoSistema {
  allowUserRegistration: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  notifyNewUsers: boolean;
  newUserNotificationAdmins: string;
  notifyUserApproval: boolean;
}

export default function SettingsPage() {
  const { data: configuracoes, isLoading, refetch } = api.base.configuracoes.getConfiguracoesSistema.useQuery();

  const { data: admins } = api.base.users.findAll.useQuery();

  const [localConfiguracoes, setLocalConfiguracoes] = useState<ConfiguracaoSistema | undefined>(configuracoes);
  const [selectedAdmins, setSelectedAdmins] = useState<number[]>([]);

  const updateMutation = api.base.configuracoes.updateConfiguracoesSistema.useMutation({
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar configurações: ${error.message}`);
    },
  });

  // Sincronizar estado local com dados do servidor
  useEffect(() => {
    if (configuracoes) {
      setLocalConfiguracoes(configuracoes);

      // Parse dos IDs dos admins selecionados
      if (configuracoes.newUserNotificationAdmins) {
        const adminIds = configuracoes.newUserNotificationAdmins
          .split(',')
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
        setSelectedAdmins(adminIds);
      }
    }
  }, [configuracoes]);

  const handleSwitchChange = (key: keyof ConfiguracaoSistema, value: boolean) => {
    setLocalConfiguracoes((prev) => (prev ? { ...prev, [key]: value } : undefined));
  };

  const handleAdminToggle = (adminId: number) => {
    setSelectedAdmins((prev) => {
      const newSelection = prev.includes(adminId) ? prev.filter((id) => id !== adminId) : [...prev, adminId];

      // Atualizar configurações locais
      const adminIdsString = newSelection.join(',');
      setLocalConfiguracoes((prev) =>
        prev
          ? {
              ...prev,
              newUserNotificationAdmins: adminIdsString,
            }
          : undefined,
      );

      return newSelection;
    });
  };

  const handleSave = () => {
    if (localConfiguracoes) {
      updateMutation.mutate(localConfiguracoes);
    }
  };

  const adminUsers = admins?.filter((user) => user.roles.includes(USER_ROLES.ADMIN)) || [];

  const header = (
    <PageHeader
      title="Configurações"
      subtitle="Gerencie as configurações gerais do sistema"
      actions={[
        <Button key="salvar-todas" onClick={handleSave} disabled={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? 'Salvando...' : 'Salvar Todas'}
        </Button>,
      ]}
    />
  );

  if (isLoading) {
    return (
      <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
        <AdminLayout header={header}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="grid gap-6">
            {/* Configurações do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>Configure as preferências gerais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir registro de novos usuários</Label>
                    <p className="text-sm text-muted-foreground">Permite que novos usuários se registrem no sistema</p>
                  </div>
                  <Switch
                    checked={localConfiguracoes?.allowUserRegistration ?? true}
                    onCheckedChange={(checked) => handleSwitchChange('allowUserRegistration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por email</Label>
                    <p className="text-sm text-muted-foreground">Enviar notificações importantes por email</p>
                  </div>
                  <Switch
                    checked={localConfiguracoes?.emailNotifications ?? true}
                    onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de manutenção</Label>
                    <p className="text-sm text-muted-foreground">Ativar modo de manutenção do sistema</p>
                  </div>
                  <Switch
                    checked={localConfiguracoes?.maintenanceMode ?? false}
                    onCheckedChange={(checked) => handleSwitchChange('maintenanceMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notificações de Novos Usuários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações de Novos Usuários
                </CardTitle>
                <CardDescription>Configure as notificações quando novos usuários se registram</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificar criação de novos usuários</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificação por email quando novos usuários se registram
                    </p>
                  </div>
                  <Switch
                    checked={localConfiguracoes?.notifyNewUsers ?? false}
                    onCheckedChange={(checked) => handleSwitchChange('notifyNewUsers', checked)}
                  />
                </div>

                {localConfiguracoes?.notifyNewUsers && (
                  <div className="space-y-3">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Administradores que recebem notificações
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Selecione quais administradores receberão as notificações
                      </p>
                    </div>

                    <div className="space-y-3">
                      {adminUsers.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">{admin.name}</Label>
                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                          </div>
                          <Switch
                            checked={selectedAdmins.includes(admin.id)}
                            onCheckedChange={() => handleAdminToggle(admin.id)}
                          />
                        </div>
                      ))}
                    </div>

                    {selectedAdmins.length === 0 && (
                      <p className="text-sm text-amber-600">
                        ⚠️ Nenhum administrador selecionado para receber notificações
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notificações de Aprovação de Usuários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações de Aprovação
                </CardTitle>
                <CardDescription>Configure as notificações de boas-vindas para usuários aprovados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificar usuários quando aprovados</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar email de boas-vindas quando usuário recebe suas primeiras permissões
                    </p>
                  </div>
                  <Switch
                    checked={localConfiguracoes?.notifyUserApproval ?? true}
                    onCheckedChange={(checked) => handleSwitchChange('notifyUserApproval', checked)}
                  />
                </div>

                {localConfiguracoes?.notifyUserApproval && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Como funciona:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Quando um usuário sem permissões recebe suas primeiras roles</li>
                      <li>• Email de boas-vindas é enviado automaticamente para o usuário</li>
                      <li>• Inclui informações sobre as permissões atribuídas</li>
                      <li>• Link direto para acessar o sistema</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
