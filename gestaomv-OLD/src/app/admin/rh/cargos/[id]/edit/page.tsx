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
import * as React from 'react';

const updateCargoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  departamentoId: z.number().min(1, 'Departamento é obrigatório'),
});

interface EditCargoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCargoPage({ params }: EditCargoPageProps) {
  const router = useRouter();
  const [cargoId, setCargoId] = React.useState<number | null>(null);

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setCargoId(parseInt(resolvedParams.id));
    });
  }, [params]);

  const { data: cargo, isLoading: isLoadingCargo } = api.rh.buscarCargo.useQuery(
    { id: cargoId! },
    { enabled: cargoId !== null && !isNaN(cargoId) },
  );

  const { data: departamentosData, isLoading: isLoadingDepartamentos } = api.rh.listarDepartamentos.useQuery({});

  const utils = api.useUtils();

  const updateCargoMutation = api.rh.atualizarCargo.useMutation({
    onSuccess: () => {
      utils.rh.listarCargos.invalidate();
      utils.rh.buscarCargo.invalidate({ id: cargoId! });
      toast.success('Cargo atualizado com sucesso!');
      router.push('/admin/rh/cargos');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar cargo', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof updateCargoSchema>) => {
    if (cargoId === null) return;
    updateCargoMutation.mutate({
      id: cargoId,
      data: values,
    });
  };

  const header = (
    <PageHeader
      title="Editar Cargo"
      subtitle={cargo ? `Editando: ${cargo.nome}` : 'Carregando...'}
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={updateCargoMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button
          key="salvar"
          type="submit"
          disabled={updateCargoMutation.isPending || isLoadingCargo || isLoadingDepartamentos}
          form="cargo-edit-form"
        >
          {updateCargoMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  if (isLoadingCargo || isLoadingDepartamentos || cargoId === null) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando dados do cargo...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!cargo) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Cargo não encontrado</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH]}>
      <AdminLayout header={header}>
        <CargoForm
          mode="edit"
          initialData={cargo}
          departamentos={departamentosData?.departamentos || []}
          isLoading={isLoadingDepartamentos}
          onSubmit={onSubmit}
          isSubmitting={updateCargoMutation.isPending}
          formId="cargo-edit-form"
        />
      </AdminLayout>
    </RouteGuard>
  );
}
