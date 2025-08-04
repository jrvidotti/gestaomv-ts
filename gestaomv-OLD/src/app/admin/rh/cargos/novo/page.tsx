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
import { CargoForm } from '@/components/rh/cargo-form';

const createCargoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  departamentoId: z.number().min(1, 'Departamento é obrigatório'),
});

export default function NovoCargoPage() {
  const router = useRouter();

  const { data: departamentosData, isLoading: isLoadingDepartamentos } = api.rh.listarDepartamentos.useQuery({});

  const utils = api.useUtils();

  const createCargoMutation = api.rh.criarCargo.useMutation({
    onSuccess: () => {
      utils.rh.listarCargos.invalidate();
      toast.success('Cargo criado com sucesso!');
      router.push('/admin/rh/cargos');
    },
    onError: (error) => {
      toast.error('Erro ao criar cargo', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createCargoSchema>) => {
    createCargoMutation.mutate(values);
  };

  const header = (
    <PageHeader
      title="Novo Cargo"
      subtitle="Cadastre um novo cargo no sistema"
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createCargoMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button
          key="salvar"
          type="submit"
          disabled={createCargoMutation.isPending || isLoadingDepartamentos}
          form="cargo-form"
        >
          {createCargoMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          <CargoForm
            mode="create"
            departamentos={departamentosData?.departamentos || []}
            isLoading={isLoadingDepartamentos}
            onSubmit={onSubmit}
            isSubmitting={createCargoMutation.isPending}
            formId="cargo-form"
          />
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
