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
import { EquipeForm } from '@/components/rh/equipe-form';
import * as React from 'react';

const updateEquipeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
});

interface EditEquipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEquipePage({ params }: EditEquipePageProps) {
  const router = useRouter();
  const [equipeId, setEquipeId] = React.useState<number | null>(null);

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setEquipeId(parseInt(resolvedParams.id));
    });
  }, [params]);

  const { data: equipe, isLoading: isLoadingEquipe } = api.rh.buscarEquipe.useQuery(
    { id: equipeId! },
    { enabled: equipeId !== null && !isNaN(equipeId) },
  );

  const utils = api.useUtils();

  const updateEquipeMutation = api.rh.atualizarEquipe.useMutation({
    onSuccess: () => {
      utils.rh.listarEquipes.invalidate();
      utils.rh.buscarEquipe.invalidate({ id: equipeId! });
      toast.success('Equipe atualizada com sucesso!');
      router.push('/admin/rh/equipes');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar equipe', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof updateEquipeSchema>) => {
    if (equipeId === null) return;
    updateEquipeMutation.mutate({
      id: equipeId,
      data: values,
    });
  };

  const header = (
    <PageHeader
      title="Editar Equipe"
      subtitle={equipe ? `Editando: ${equipe.nome}` : 'Carregando...'}
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={updateEquipeMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button
          key="salvar"
          type="submit"
          disabled={updateEquipeMutation.isPending || isLoadingEquipe}
          form="equipe-edit-form"
        >
          {updateEquipeMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  if (isLoadingEquipe || equipeId === null) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando dados da equipe...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!equipe) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Equipe não encontrada</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH]}>
      <AdminLayout header={header}>
        <EquipeForm
          mode="edit"
          initialData={equipe}
          onSubmit={onSubmit}
          isSubmitting={updateEquipeMutation.isPending}
          formId="equipe-edit-form"
        />
      </AdminLayout>
    </RouteGuard>
  );
}
