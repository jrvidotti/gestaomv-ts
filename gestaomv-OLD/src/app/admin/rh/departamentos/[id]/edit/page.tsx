'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { USER_ROLES } from '@/shared';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { RouteGuard } from '@/components/auth/route-guard';
import { DepartamentoForm } from '@/components/rh/departamento-form';
import * as React from 'react';

const updateDepartamentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
});

interface EditDepartamentoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditDepartamentoPage({ params }: EditDepartamentoPageProps) {
  const router = useRouter();
  const [departamentoId, setDepartamentoId] = React.useState<number | null>(null);

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setDepartamentoId(parseInt(resolvedParams.id));
    });
  }, [params]);

  const { data: departamento, isLoading: isLoadingDepartamento } = api.rh.buscarDepartamento.useQuery(
    { id: departamentoId! },
    { enabled: departamentoId !== null && !isNaN(departamentoId) },
  );

  const utils = api.useUtils();

  const updateDepartamentoMutation = api.rh.atualizarDepartamento.useMutation({
    onSuccess: () => {
      utils.rh.listarDepartamentos.invalidate();
      utils.rh.buscarDepartamento.invalidate({ id: departamentoId! });
      toast.success('Departamento atualizado com sucesso!');
      router.push('/admin/rh/departamentos');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar departamento', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof updateDepartamentoSchema>) => {
    if (departamentoId === null) return;
    updateDepartamentoMutation.mutate({
      id: departamentoId,
      data: values,
    });
  };

  const header = (
    <PageHeader
      title="Editar Departamento"
      subtitle={departamento ? `Editando: ${departamento.nome}` : 'Carregando...'}
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={updateDepartamentoMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button
          key="salvar"
          type="submit"
          disabled={updateDepartamentoMutation.isPending || isLoadingDepartamento}
          form="departamento-edit-form"
        >
          {updateDepartamentoMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  if (isLoadingDepartamento || departamentoId === null) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando dados do departamento...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!departamento) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Departamento não encontrado</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
      <AdminLayout header={header}>
        <DepartamentoForm
          mode="edit"
          initialData={departamento}
          onSubmit={onSubmit}
          isSubmitting={updateDepartamentoMutation.isPending}
          formId="departamento-edit-form"
        />
      </AdminLayout>
    </RouteGuard>
  );
}
