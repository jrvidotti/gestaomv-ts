'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { updateEmpresaSchema, USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { EmpresaForm } from '@/components/base/empresa-form';
import * as React from 'react';

interface EditEmpresaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEmpresaPage({ params }: EditEmpresaPageProps) {
  const router = useRouter();
  const [empresaId, setEmpresaId] = React.useState<number | null>(null);

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setEmpresaId(parseInt(resolvedParams.id));
    });
  }, [params]);

  const { data: empresa, isLoading: isLoadingEmpresa } = api.base.empresas.findOne.useQuery(
    { id: empresaId! },
    { enabled: empresaId !== null && !isNaN(empresaId) },
  );

  const utils = api.useUtils();

  const updateEmpresaMutation = api.base.empresas.update.useMutation({
    onSuccess: () => {
      utils.base.empresas.findAll.invalidate();
      utils.base.empresas.findOne.invalidate({ id: empresaId! });
      toast.success('Empresa atualizada com sucesso!');
      router.push('/admin/base/empresas');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar empresa', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof updateEmpresaSchema>) => {
    if (empresaId === null) return;
    updateEmpresaMutation.mutate({
      id: empresaId,
      data: values,
    });
  };

  const header = (
    <PageHeader
      title="Editar Empresa"
      subtitle={empresa ? `Editando: ${empresa.razaoSocial}` : 'Carregando...'}
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={updateEmpresaMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button
          key="salvar"
          type="submit"
          disabled={updateEmpresaMutation.isPending || isLoadingEmpresa}
          form="empresa-edit-form"
        >
          {updateEmpresaMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  if (isLoadingEmpresa || empresaId === null) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando dados da empresa...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!empresa) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Empresa não encontrada</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <EmpresaForm
          mode="edit"
          initialData={empresa}
          onSubmit={onSubmit}
          isSubmitting={updateEmpresaMutation.isPending}
          formId="empresa-edit-form"
          showUnidadesInfo={true}
        />
      </AdminLayout>
    </RouteGuard>
  );
}
