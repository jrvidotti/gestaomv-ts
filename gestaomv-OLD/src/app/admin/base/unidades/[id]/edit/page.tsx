'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { updateUnidadeSchema, USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { UnidadeForm } from '@/components/base/unidade-form';
import * as React from 'react';

interface EditUnidadePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditUnidadePage({ params }: EditUnidadePageProps) {
  const router = useRouter();
  const [unidadeId, setUnidadeId] = React.useState<number | null>(null);

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setUnidadeId(parseInt(resolvedParams.id));
    });
  }, [params]);

  const { data: unidade, isLoading: isLoadingUnidade } = api.base.unidades.findOne.useQuery(
    { id: unidadeId! },
    { enabled: unidadeId !== null && !isNaN(unidadeId) },
  );

  const { data: empresas, isLoading: isLoadingEmpresas } = api.base.empresas.findAll.useQuery();

  const utils = api.useUtils();

  const updateUnidadeMutation = api.base.unidades.update.useMutation({
    onSuccess: () => {
      utils.base.unidades.findAll.invalidate();
      utils.base.unidades.findOne.invalidate({ id: unidadeId! });
      toast.success('Unidade atualizada com sucesso!');
      router.push('/admin/base/unidades');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar unidade', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof updateUnidadeSchema>) => {
    if (unidadeId === null) return;
    updateUnidadeMutation.mutate({
      id: unidadeId,
      data: values,
    });
  };

  const header = (
    <PageHeader
      title="Editar Unidade"
      subtitle={unidade ? `Editando: ${unidade.nome}` : 'Carregando...'}
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={updateUnidadeMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button
          key="salvar"
          type="submit"
          disabled={updateUnidadeMutation.isPending || isLoadingUnidade || isLoadingEmpresas}
          form="unidade-edit-form"
        >
          {updateUnidadeMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  if (isLoadingUnidade || isLoadingEmpresas || unidadeId === null) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando dados da unidade...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!unidade) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Unidade não encontrada</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN]}>
      <AdminLayout header={header}>
        <UnidadeForm
          mode="edit"
          initialData={unidade}
          empresas={empresas || []}
          isLoading={isLoadingEmpresas}
          onSubmit={onSubmit}
          isSubmitting={updateUnidadeMutation.isPending}
          formId="unidade-edit-form"
        />
      </AdminLayout>
    </RouteGuard>
  );
}
