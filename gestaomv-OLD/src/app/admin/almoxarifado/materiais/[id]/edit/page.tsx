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
import * as React from 'react';
import { USER_ROLES } from '@/shared/constants/user-roles';

// Schema para atualização de material
const atualizarMaterialSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  descricao: z.string().optional(),
  tipo: z
    .enum([
      'EMBALAGENS_PRESENTE',
      'MATERIAIS_EXPEDIENTE',
      'MATERIAIS_COZINHA',
      'MATERIAIS_LIMPEZA',
      'SACOLAS_VENDA',
      'SACOLAS_PERSONALIZADA',
    ])
    .optional(),
  valorUnitario: z.number().min(0, 'Valor deve ser maior ou igual a zero').optional(),
  foto: z.string().optional(),
  unidadeMedida: z.string().min(1, 'Unidade de medida é obrigatória').optional(),
  ativo: z.boolean().optional(),
});

interface EditMaterialPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMaterialPage({ params }: EditMaterialPageProps) {
  const router = useRouter();
  const [materialId, setMaterialId] = React.useState<number | null>(null);

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setMaterialId(parseInt(resolvedParams.id));
    });
  }, [params]);

  const { data: material, isLoading: isLoadingMaterial } = api.almoxarifado.buscarMaterial.useQuery(
    { id: materialId! },
    { enabled: materialId !== null && !isNaN(materialId) },
  );

  const utils = api.useUtils();

  const updateMaterialMutation = api.almoxarifado.atualizarMaterial.useMutation({
    onSuccess: () => {
      utils.almoxarifado.listarMateriais.invalidate();
      utils.almoxarifado.buscarMaterial.invalidate({ id: materialId! });
      toast.success('Material atualizado com sucesso!');
      router.push('/admin/almoxarifado/materiais');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar material', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof atualizarMaterialSchema>) => {
    if (materialId === null) return;
    updateMaterialMutation.mutate({
      id: materialId,
      data: values,
    });
  };

  const header = (
    <PageHeader
      title="Editar Material"
      subtitle={material ? `Editando: ${material.nome}` : 'Carregando...'}
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={updateMaterialMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button
          key="salvar"
          type="submit"
          disabled={updateMaterialMutation.isPending || isLoadingMaterial}
          form="material-edit-form"
        >
          {updateMaterialMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  if (isLoadingMaterial || materialId === null) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando dados do material...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!material) {
    return (
      <AdminLayout header={header}>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">Material não encontrado</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_ALMOXARIFADO]}>
      <AdminLayout header={header}>
        <MaterialForm
          mode="edit"
          initialData={material}
          onSubmit={onSubmit}
          isSubmitting={updateMaterialMutation.isPending}
          formId="material-edit-form"
        />
      </AdminLayout>
    </RouteGuard>
  );
}
