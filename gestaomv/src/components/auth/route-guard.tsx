"use client";

import type { UserRoleType } from "@/constants";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Unauthorized } from "./unauthorized";

interface RouteGuardProps {
	children: ReactNode;
	requiredRoles?: UserRoleType[];
	requireAuth?: boolean;
	fallback?: ReactNode;
	title?: string;
	description?: string;
}

export function RouteGuard({
	children,
	requiredRoles = [],
	requireAuth = true,
	fallback,
	title,
	description,
}: RouteGuardProps) {
	const { isAuthenticated, hasAnyRole, isLoading } = useAuth();
	const { canAccessPage, isAdmin } = usePermissions();
	const routerState = useRouterState();
	const pathname = routerState.location.pathname;

	// Ainda carregando autenticação
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	// Verificar se autenticação é obrigatória
	if (requireAuth && !isAuthenticated) {
		return (
			<Unauthorized
				title="Acesso Requerido"
				description="Você precisa estar logado para acessar esta página."
				showBackButton={false}
			/>
		);
	}

	// Admin sempre tem acesso
	if (isAdmin) {
		return <>{children}</>;
	}

	// Verificar roles específicas se fornecidas
	if (requiredRoles.length > 0) {
		if (!hasAnyRole(requiredRoles)) {
			return (
				fallback || (
					<Unauthorized
						title={title}
						description={
							description ||
							`Você precisa ter uma das seguintes permissões: ${requiredRoles.join(", ")}`
						}
					/>
				)
			);
		}
	}

	// Verificar acesso à página baseado na URL
	if (!canAccessPage(pathname)) {
		return (
			fallback || (
				<Unauthorized
					title={title}
					description={
						description ||
						"Você não tem permissão para acessar esta funcionalidade."
					}
				/>
			)
		);
	}

	// Usuário tem permissão, renderizar children
	return <>{children}</>;
}

// Hook utilitário para usar dentro de componentes
export function useRouteAccess(requiredRoles: UserRoleType[] = []) {
	const { isAuthenticated, hasAnyRole } = useAuth();
	const { canAccessPage, isAdmin } = usePermissions();
	const routerState = useRouterState();
	const pathname = routerState.location.pathname;

	const hasAccess = () => {
		if (!isAuthenticated) return false;
		if (isAdmin) return true;

		if (requiredRoles.length > 0) {
			return hasAnyRole(requiredRoles);
		}

		return canAccessPage(pathname);
	};

	return {
		hasAccess: hasAccess(),
		isAuthenticated,
		isAdmin,
		canAccessPage: canAccessPage(pathname),
	};
}
