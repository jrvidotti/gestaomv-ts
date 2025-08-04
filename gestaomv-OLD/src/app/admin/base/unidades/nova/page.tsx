'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { createUnidadeSchema, USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { UnidadeForm } from '@/components/base/unidade-form';

export default function NewUnidadePage() {
  const router = useRouter();

  const { data: empresas, isLoading: isLoadingEmpresas } = api.base.empresas.findAll.useQuery();

  const utils = api.useUtils();

  const createUnidadeMutation = api.base.unidades.create.useMutation({
    onSuccess: (data) => {
      utils.base.unidades.findAll.invalidate();
      toast.success('Unidade criada com sucesso!');
      router.push('/admin/base/unidades');
    },
    onError: (error) => {
      toast.error('Erro ao criar unidade', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createUnidadeSchema>) => {
    createUnidadeMutation.mutate(values);
  };

  const header = (
    <PageHeader
      title="Nova Unidade"
      subtitle="Cadastre uma nova unidade no sistema"
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createUnidadeMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button
          key="salvar"
          type="submit"
          disabled={createUnidadeMutation.isPending || isLoadingEmpresas}
          form="unidade-form"
        >
          {createUnidadeMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          <UnidadeForm
            mode="create"
            empresas={empresas || []}
            isLoading={isLoadingEmpresas}
            onSubmit={onSubmit}
            isSubmitting={createUnidadeMutation.isPending}
            formId="unidade-form"
          />
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
