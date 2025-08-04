'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { createEmpresaSchema, USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { EmpresaForm } from '@/components/base/empresa-form';

export default function NewEmpresaPage() {
  const router = useRouter();

  const utils = api.useUtils();

  const createEmpresaMutation = api.base.empresas.create.useMutation({
    onSuccess: (data) => {
      utils.base.empresas.findAll.invalidate();
      toast.success('Empresa criada com sucesso!');
      router.push('/admin/base/empresas');
    },
    onError: (error) => {
      toast.error('Erro ao criar empresa', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createEmpresaSchema>) => {
    createEmpresaMutation.mutate(values);
  };

  const header = (
    <PageHeader
      title="Nova Empresa"
      subtitle="Cadastre uma nova empresa no sistema"
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createEmpresaMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button key="salvar" type="submit" disabled={createEmpresaMutation.isPending} form="empresa-form">
          {createEmpresaMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <EmpresaForm
          mode="create"
          onSubmit={onSubmit}
          isSubmitting={createEmpresaMutation.isPending}
          formId="empresa-form"
        />
      </AdminLayout>
    </RouteGuard>
  );
}
