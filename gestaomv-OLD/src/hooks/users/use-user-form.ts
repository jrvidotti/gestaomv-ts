'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/trpc';
import { UserRoleType } from '@/shared';
import { toast } from 'sonner';

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  roles: UserRoleType[];
  isActive: boolean;
}

interface UseUserFormOptions {
  userId?: number;
  onSuccess?: () => void;
  redirectOnSuccess?: string;
}

export function useUserForm({ userId, onSuccess, redirectOnSuccess }: UseUserFormOptions = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const utils = api.useUtils();

  // Queries
  const { data: user, isLoading: isLoadingUser } = api.base.users.findOne.useQuery(
    { id: userId! },
    { enabled: !!userId },
  );

  // Mutations
  const createUserMutation = api.base.users.create.useMutation({
    onSuccess: (createdUser) => {
      utils.base.users.findAll.invalidate();
      toast.success('Usuário criado com sucesso!');

      if (onSuccess) onSuccess();
      if (redirectOnSuccess) router.push(redirectOnSuccess);
    },
    onError: (error) => {
      toast.error('Erro ao criar usuário', {
        description: error.message,
      });
    },
  });

  const updateUserMutation = api.base.users.update.useMutation({
    onSuccess: () => {
      utils.base.users.findAll.invalidate();
      if (userId) {
        utils.base.users.findOne.invalidate({ id: userId });
      }
      toast.success('Usuário atualizado com sucesso!');

      if (onSuccess) onSuccess();
      if (redirectOnSuccess) router.push(redirectOnSuccess);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar usuário', {
        description: error.message,
      });
    },
  });

  // Função para submeter o formulário
  const submitUser = async (data: UserFormData) => {
    setIsLoading(true);

    try {
      if (userId) {
        // Atualizar usuário existente
        const updateData: Record<string, unknown> = { ...data };

        // Remover senha se estiver vazia (manter senha atual)
        if (!updateData.password) {
          delete updateData.password;
        }

        const result = await updateUserMutation.mutateAsync({
          id: userId,
          data: updateData,
        });
        return result;
      } else {
        // Criar novo usuário
        if (!data.password) {
          throw new Error('Senha é obrigatória para novos usuários');
        }

        const result = await createUserMutation.mutateAsync({ ...data, password: data.password! });
        return result;
      }
    } catch (error) {
      console.error('Erro ao submeter usuário:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Estados computados
  const isSubmitting = isLoading || createUserMutation.isPending || updateUserMutation.isPending;
  const isEditing = !!userId;

  return {
    // Estados
    isLoading: isSubmitting,
    isLoadingUser,
    isEditing,

    // Dados
    user,

    // Funções
    submitUser,

    // Utilitários
    router,
  };
}
