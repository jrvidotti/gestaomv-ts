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

const createDepartamentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
});

export default function NovoDepartamentoPage() {
  const router = useRouter();

  const utils = api.useUtils();

  const createDepartamentoMutation = api.rh.criarDepartamento.useMutation({
    onSuccess: () => {
      utils.rh.listarDepartamentos.invalidate();
      toast.success('Departamento criado com sucesso!');
      router.push('/admin/rh/departamentos');
    },
    onError: (error) => {
      toast.error('Erro ao criar departamento', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createDepartamentoSchema>) => {
    createDepartamentoMutation.mutate(values);
  };

  const header = (
    <PageHeader
      title="Novo Departamento"
      subtitle="Cadastre um novo departamento no sistema"
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createDepartamentoMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button key="salvar" type="submit" disabled={createDepartamentoMutation.isPending} form="departamento-form">
          {createDepartamentoMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          <DepartamentoForm
            mode="create"
            onSubmit={onSubmit}
            isSubmitting={createDepartamentoMutation.isPending}
            formId="departamento-form"
          />
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
