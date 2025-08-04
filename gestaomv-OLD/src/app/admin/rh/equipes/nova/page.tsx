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

const createEquipeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
});

export default function NovaEquipePage() {
  const router = useRouter();

  const utils = api.useUtils();

  const createEquipeMutation = api.rh.criarEquipe.useMutation({
    onSuccess: () => {
      utils.rh.listarEquipes.invalidate();
      toast.success('Equipe criada com sucesso!');
      router.push('/admin/rh/equipes');
    },
    onError: (error) => {
      toast.error('Erro ao criar equipe', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createEquipeSchema>) => {
    createEquipeMutation.mutate(values);
  };

  const header = (
    <PageHeader
      title="Nova Equipe"
      subtitle="Cadastre uma nova equipe no sistema"
      onClickBack={() => router.back()}
      backButtonText="Voltar"
      actions={[
        <Button
          key="cancelar"
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createEquipeMutation.isPending}
        >
          Cancelar
        </Button>,
        <Button key="salvar" type="submit" disabled={createEquipeMutation.isPending} form="equipe-form">
          {createEquipeMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>,
      ]}
    />
  );

  return (
    <RouteGuard requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.GERENCIA_RH, USER_ROLES.USUARIO_RH]}>
      <AdminLayout header={header}>
        <div className="space-y-6">
          <EquipeForm
            mode="create"
            onSubmit={onSubmit}
            isSubmitting={createEquipeMutation.isPending}
            formId="equipe-form"
          />
        </div>
      </AdminLayout>
    </RouteGuard>
  );
}
