'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { UserRoleType } from '@/shared';
import { toast } from 'sonner';

interface UseUserRolesOptions {
  userId: number;
  enabled?: boolean;
}

export function useUserRoles({ userId, enabled = true }: UseUserRolesOptions) {
  const [isUpdating, setIsUpdating] = useState(false);

  const utils = api.useUtils();

  // Query para buscar roles do usuário
  const {
    data: userRoles = [],
    isLoading: isLoadingRoles,
    error,
  } = api.auth.getUserRoles.useQuery({ userId }, { enabled: enabled && !!userId });

  // Query para buscar dados completos do usuário
  const { data: userData, isLoading: isLoadingUser } = api.base.users.findOne.useQuery(
    { id: userId },
    { enabled: enabled && !!userId },
  );

  // Mutations
  const addRoleMutation = api.auth.addUserRole.useMutation({
    onSuccess: () => {
      utils.auth.getUserRoles.invalidate({ userId });
      utils.base.users.findOne.invalidate({ id: userId });
    },
    onError: (error) => {
      toast.error('Erro ao adicionar função', {
        description: error.message,
      });
    },
  });

  const removeRoleMutation = api.auth.removeUserRole.useMutation({
    onSuccess: () => {
      utils.auth.getUserRoles.invalidate({ userId });
      utils.base.users.findOne.invalidate({ id: userId });
    },
    onError: (error) => {
      toast.error('Erro ao remover função', {
        description: error.message,
      });
    },
  });

  // Função para adicionar role
  const addRole = async (role: UserRoleType) => {
    setIsUpdating(true);
    try {
      await addRoleMutation.mutateAsync({ userId, role });
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para remover role
  const removeRole = async (role: UserRoleType) => {
    setIsUpdating(true);
    try {
      await removeRoleMutation.mutateAsync({ userId, role });
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para toggle role (adicionar ou remover)
  const toggleRole = async (role: UserRoleType, isActive: boolean) => {
    // setTimeout(async () => {
    if (isActive) {
      await addRole(role);
    } else {
      await removeRole(role);
    }
    // }, 1000);
  };

  // Função para verificar se usuário tem uma role
  const hasRole = (role: UserRoleType): boolean => {
    if (!userData) return false;

    // Verifica role principal ou roles adicionais
    return userData.roles.includes(role);
  };

  // Função para obter todas as roles do usuário
  const getAllRoles = (): UserRoleType[] => {
    if (!userData) return [];

    const allRoles: UserRoleType[] = [];
    if (userData.roles) {
      userData.roles.forEach((role: UserRoleType) => {
        if (!allRoles.includes(role)) {
          allRoles.push(role);
        }
      });
    }
    return allRoles;
  };

  // Estados computados
  const isLoading = isLoadingRoles || isLoadingUser;
  const isMutating = addRoleMutation.isPending || removeRoleMutation.isPending || isUpdating;

  return {
    // Estados
    isLoading,
    isMutating,
    error,

    // Dados
    userData,
    userRoles,

    // Funções
    addRole,
    removeRole,
    toggleRole,
    hasRole,
    getAllRoles,

    // Utilitários para debugging
    _debug: {
      userId,
      enabled,
      userRoles,
      userData,
    },
  };
}
