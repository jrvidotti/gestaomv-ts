"use client";

import type { UserRoleType } from "@/modules/core/types";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface UseUserRolesOptions {
	userId: number;
	enabled?: boolean;
}

export function useUserRoles({ userId, enabled = true }: UseUserRolesOptions) {
	const [isUpdating, setIsUpdating] = useState(false);
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// Query para buscar roles do usuário
	const {
		data: userRoles = [],
		isLoading: isLoadingRoles,
		error,
	} = useQuery(
		trpc.auth.getUserRoles.queryOptions(
			{ userId },
			{ enabled: enabled && !!userId },
		),
	);

	// Query para buscar dados completos do usuário
	const { data: userData, isLoading: isLoadingUser } = useQuery(
		trpc.users.findOne.queryOptions(
			{ id: userId },
			{ enabled: enabled && !!userId },
		),
	);

	// Mutations
	const addRoleMutation = useMutation(
		trpc.auth.addUserRole.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["auth.getUserRoles", { userId }],
				});
				queryClient.invalidateQueries({
					queryKey: ["users.findOne", { id: userId }],
				});
			},
			onError: (error) => {
				toast.error("Erro ao adicionar função", {
					description: error.message,
				});
			},
		}),
	);

	const removeRoleMutation = useMutation(
		trpc.auth.removeUserRole.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["auth.getUserRoles", { userId }],
				});
				queryClient.invalidateQueries({
					queryKey: ["users.findOne", { id: userId }],
				});
			},
			onError: (error) => {
				toast.error("Erro ao remover função", {
					description: error.message,
				});
			},
		}),
	);

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
			for (const role of userData.roles) {
				if (!allRoles.includes(role)) {
					allRoles.push(role);
				}
			}
		}
		return allRoles;
	};

	// Estados computados
	const isLoading = isLoadingRoles || isLoadingUser;
	const isMutating =
		addRoleMutation.isPending || removeRoleMutation.isPending || isUpdating;

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
