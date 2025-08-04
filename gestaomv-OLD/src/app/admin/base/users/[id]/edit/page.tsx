'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserBasicForm, UserRolesManager } from '@/components/users';
import { useUserForm, useUserRoles, type UserFormData } from '@/hooks/users';
import { UserRoleType, USER_ROLES } from '@/shared';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { useEffect, useState } from 'react';

export default function EditUserPage() {
  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <EditUserPageContent />
    </RouteGuard>
  );
}

function EditUserPageContent() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.id as string);
  const [userRoles, setUserRoles] = useState<UserRoleType[] | undefined>(undefined);

  const { user, isLoadingUser, submitUser, isLoading } = useUserForm({
    userId,
    redirectOnSuccess: '/admin/base/users',
  });

  useEffect(() => {
    if (user) {
      setUserRoles(user.roles);
    }
  }, [user]);

  useEffect(() => {
    console.log('userRoles', userRoles);
  }, [userRoles]);

  // Loading state
  if (isLoadingUser) {
    return (
      <AdminLayout
        header={
          <PageHeader
            title="Editar Usuário"
            subtitle={`Atualize as informações e permissões do usuário`}
            onClickBack={() => router.back()}
            actions={[
              <Button key="cancelar" type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancelar
              </Button>,
            ]}
          />
        }
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" disabled>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (!user && !isLoadingUser) {
    return (
      <AdminLayout
        header={
          <PageHeader
            title="Editar Usuário"
            subtitle={`Atualize as informações e permissões do usuário`}
            onClickBack={() => router.back()}
            actions={[
              <Button key="cancelar" type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancelar
              </Button>,
            ]}
          />
        }
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Usuário não encontrado</h2>
              <p className="text-muted-foreground">O usuário solicitado não foi encontrado</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>Usuário com ID {userId} não foi encontrado.</span>
              </div>
              <div className="mt-4">
                <Button onClick={() => router.push('/admin/base/users')}>Voltar para lista de usuários</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const handleBasicFormSubmit = async (data: { name: string; email: string; isActive: boolean; password?: string }) => {
    await submitUser({ ...data, roles: userRoles || [] });
  };

  const handleRoleChange = async (role: UserRoleType, isActive: boolean) => {
    if (isActive && !userRoles?.includes(role)) {
      setUserRoles([...(userRoles || []), role]);
    } else if (!isActive && userRoles?.includes(role)) {
      setUserRoles(userRoles?.filter((r) => r !== role) || []);
    }
  };

  return (
    <AdminLayout
      header={
        <PageHeader
          title={`Editar Usuário - ${user?.name}`}
          subtitle={`Atualize as informações e permissões do usuário`}
          onClickBack={() => router.back()}
          actions={[
            <Button key="cancelar" type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>,
            <Button key="salvar" type="submit" disabled={isLoading} form="user-edit-form">
              {isLoading ? 'Salvando...' : 'Atualizar'}
            </Button>,
          ]}
        />
      }
    >
      <div className="space-y-6">
        {/* Forms */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Form */}
          <UserBasicForm
            initialData={{
              name: user?.name || '',
              email: user?.email || '',
              isActive: user?.isActive ?? true,
            }}
            isEditing={true}
            onSubmit={handleBasicFormSubmit}
            onCancel={() => router.back()}
            isLoading={isLoading}
          />

          {/* Roles Manager */}
          {userRoles && <UserRolesManager userRoles={userRoles} onRoleChange={handleRoleChange} />}
        </div>
      </div>
    </AdminLayout>
  );
}
