import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/")({
	component: AdminRedirect,
});

function AdminRedirect() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();
	const { getAccessibleModules } = usePermissions();

	useEffect(() => {
		// Aguardar carregamento completo antes de qualquer redirecionamento
		if (isLoading) return;

		// Só redirecionar para login se realmente não estiver autenticado
		if (!isAuthenticated) {
			router.navigate({ to: "/login" });
			return;
		}

		// Aguardar um tick para garantir que o estado de autenticação está estável
		const timeoutId = setTimeout(() => {
			// Obter módulos acessíveis para o usuário
			const accessibleModules = getAccessibleModules();

			if (accessibleModules.length > 0) {
				// Redirecionar para o primeiro módulo acessível
				const targetModule = accessibleModules[0];
				router.navigate({ to: targetModule.url });
			} else {
				// Se não tem acesso a nenhum módulo, redirecionar para perfil
				// onde o usuário pode ver que precisa de permissões
				router.navigate({ to: "/admin/user/profile" });
			}
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [isAuthenticated, isLoading, router, getAccessibleModules]);

	// Mostrar loading enquanto determina para onde redirecionar
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
			</div>
		);
	}

	// Mostrar loading durante redirecionamento
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
				<p className="text-muted-foreground">Redirecionando...</p>
			</div>
		</div>
	);
}
