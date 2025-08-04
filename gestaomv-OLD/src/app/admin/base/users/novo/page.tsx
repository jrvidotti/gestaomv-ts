'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserBasicForm } from '@/components/users';
import { useUserForm, type UserFormData } from '@/hooks/users';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { USER_ROLES } from '@/shared';

export default function NewUserPage() {
  const router = useRouter();

  const { submitUser, isLoading } = useUserForm({});

  const handleBasicFormSubmit = async (data: { name: string; email: string; isActive: boolean; password?: string }) => {
    try {
      const result = await submitUser({ ...data, roles: [] });

      // Verificar se o resultado contém o ID do usuário criado
      if (result && typeof result === 'object' && 'id' in result) {
        toast.success('Usuário criado com sucesso!', {
          description: 'Redirecionando para configurar permissões...',
        });
        router.push(`/admin/base/users/${result.id}/edit`);
      } else {
        // Fallback caso não tenha o ID - redirecionar para lista
        toast.success('Usuário criado com sucesso!');
        router.push('/admin/base/users');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const header = (
    <PageHeader
      title="Novo Usuário"
      subtitle="Crie um novo usuário com dados básicos"
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button key="cancelar" type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>,
        <Button key="salvar" type="submit" disabled={isLoading} form="user-edit-form">
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <UserBasicForm onSubmit={handleBasicFormSubmit} onCancel={() => router.back()} isLoading={isLoading} />
      </AdminLayout>
    </RouteGuard>
  );
}
