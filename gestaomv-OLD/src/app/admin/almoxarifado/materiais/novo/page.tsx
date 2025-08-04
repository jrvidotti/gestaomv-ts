'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { MaterialForm } from '@/components/almoxarifado/material-form';
import { criarMaterialSchema } from '@/shared';
import { USER_ROLES } from '@/shared/constants/user-roles';

export default function NovoMaterialPage() {
  const router = useRouter();

  const utils = api.useUtils();

  const createMaterialMutation = api.almoxarifado.criarMaterial.useMutation({
    onSuccess: () => {
      utils.almoxarifado.listarMateriais.invalidate();
      toast.success('Material criado com sucesso!');
      router.push('/admin/almoxarifado/materiais');
    },
    onError: (error) => {
      toast.error('Erro ao criar material', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof criarMaterialSchema>) => {
    createMaterialMutation.mutate(values);
  };

  const header = (
    <PageHeader
      title="Novo Material"
      subtitle="Cadastre um novo material no almoxarifado"
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createMaterialMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button key="salvar" type="submit" disabled={createMaterialMutation.isPending} form="material-form">
          {createMaterialMutation.isPending ? 'Salvando...' : 'Salvar Material'}
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_ALMOXARIFADO]}>
      <AdminLayout header={header}>
        <MaterialForm
          mode="create"
          onSubmit={onSubmit}
          isSubmitting={createMaterialMutation.isPending}
          formId="material-form"
        />
      </AdminLayout>
    </RouteGuard>
  );
}
